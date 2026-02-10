import env from "#config/env.js";
import crypto from "crypto";

// Paymob Payment Gateway Helper
// Handles all Paymob API integration including Intention API and Webhook verification

// Create a Payment Intention with Paymob
export const createPaymentIntention = async (
  orderId,
  amount,
  subscription,
  user,
) => {
  try {
    const response = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${env.paymobSecretKey}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents as required by Paymob
        currency: "EGP",
        payment_methods: [env.paymobPaymentIntegrationId],
        items: [
          {
            name: `Subscription: ${subscription.name}`,
            amount: Math.round(amount * 100),
            quantity: 1,
            description: subscription.description || "Subscription Plan",
          },
        ],
        billing_data: {
          apartment: "NA",
          first_name: user.firstName,
          last_name: user.lastName,
          street: "NA",
          building: "NA",
          phone_number: user.phone || "NA",
          city: "NA",
          state: "NA",
          country: "EG",
          email: user.email,
          floor: "NA",
          postal_code: "NA",
        },
        expiration: 3600, // Intention valid for 1 hour
        // Webhook callback (server-to-server from Paymob)
        // Reference: https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac/overview
        notification_url: `${env.backendUrl}/api/subscriptions/webhook`,
        // Client redirect URL after payment completes
        // Reference: https://developers.paymob.com/paymob-docs/developers/checkout-experiences/unified-checkout-redirection
        // Client page should call /api/subscriptions/payment/success to verify and activate
        redirection_url: `${env.frontendUrl}/subscription/payment-result?orderId=${orderId}`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(async () => {
        return { raw: await response.text() };
      });

      // Format validation errors nicely
      const formattedError = formatPaymobError(errorBody);

      throw {
        status: response.status,
        message: "PayMob validation error",
        name: "PayMobError",
        errors: formattedError,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating payment intention:", error);
    throw error;
  }
};

//Get Payment Transaction Details from Paymob
export const getPaymobTransaction = async (trx_id) => {
  try {
    const token = await getPaymobAuthToken();
    console.log(token);

    const response = await fetch(
      `https://accept.paymob.com/api/acceptance/transactions/${trx_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch payment intention: ${error ? JSON.stringify(error) : response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payment intention:", error);
    throw error;
  }
};

// Get Paymob Auth Token
export const getPaymobAuthToken = async () => {
  try {
    const response = await fetch(`https://accept.paymob.com/api/auth/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: env.paymobApiKey,
      }),
    });

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching Paymob auth token:", error);
    throw error;
  }
};

// Generate Unified Checkout URL
export const generateCheckoutUrl = (clientSecret) => {
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${env.paymobPublicKey}&clientSecret=${clientSecret}`;
};

// Verify Transaction Callback HMAC Signature
export const verifyTransactionCallbackSignature = (
  webhookData,
  hmacSignature,
) => {
  try {
    const hmacKey = env.paymobWebhookSecret;

    if (!hmacKey) {
      console.warn("PAYMOB_WEBHOOK_SECRET not configured");
      return false;
    }

    // Paymob sends nested structure: { type, obj: { ...transaction data... }, ... }
    // Extract the transaction object
    const transaction = webhookData.obj || webhookData;

    // HMAC String Keys in lexicographical order (as per Paymob docs)
    // Reference: https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac/hmac/hmac-transaction-callback
    const hmacKeys = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "obj.id", // For POST callbacks; use transaction.id
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order.id", // For POST callbacks; use transaction.order?.id
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];

    // Build the HMAC string by extracting values in lexicographical order
    let bodyString = "";

    hmacKeys.forEach((key) => {
      let value = "";

      if (key === "obj.id") {
        value = transaction.id || "";
      } else if (key === "order.id") {
        value = transaction.order?.id || "";
      } else if (key.includes(".")) {
        // Handle nested keys like source_data.pan
        const [parent, child] = key.split(".");
        value = transaction[parent]?.[child] || "";
      } else {
        value = transaction[key] ?? "";
      }

      // Convert boolean to string (true/false)
      if (typeof value === "boolean") {
        value = String(value);
      } else if (value === null || value === undefined) {
        value = "";
      } else {
        value = String(value);
      }

      bodyString += value;
    });

    // Generate HMAC using SHA-512
    const computed = crypto
      .createHmac("sha512", hmacKey)
      .update(bodyString)
      .digest("hex");

    return computed === hmacSignature;
  } catch (error) {
    console.error("Error verifying transaction callback signature:", error);
    return false;
  }
};

function formatPaymobError(error, parentKey = "") {
  if (!error) return ["Unknown error"];

  // If it's a string or number → return directly
  if (typeof error === "string" || typeof error === "number") {
    return [parentKey ? `${parentKey}: ${error}` : error.toString()];
  }

  // If it's an array → format each item
  if (Array.isArray(error)) {
    return error.flatMap((item) => formatPaymobError(item, parentKey));
  }

  // If it's an object → recursively process keys
  if (typeof error === "object") {
    return Object.entries(error).flatMap(([key, value]) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      return formatPaymobError(value, newKey);
    });
  }

  return ["Unknown error"];
}
