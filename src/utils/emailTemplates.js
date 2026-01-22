export const otpEmailTemplate = (otp, type = "signup") =>
  `
    <div style="
        font-family: Arial, sans-serif; 
        max-width: 600px; 
        margin: auto; 
        padding: 20px; 
        border: 1px solid #e0e0e0; 
        border-radius: 10px;
        background-color: #f9f9f9;
    ">
    <h2 style="
        color: #333333; 
        text-align: center;
    ">Diet and Wellness</h2>
    <p style="
        font-size: 16px; 
        color: #555555;
    ">
        Hello,
    </p>
    <p style="
        font-size: 16px; 
        color: #555555;
    ">
        ${type == "signup" ? "You requested a verification code for your account signup." : "You requested a password reset code."} Please use the OTP below to proceed:
    </p>
    <div style="
        background-color: #ffffff;
        padding: 15px 25px;
        text-align: center;
        border-radius: 8px;
        margin: 20px 0;
        border: 1px solid #e0e0e0;
    ">
        <span style="
        font-size: 24px;
        font-weight: bold;
        color: #1a73e8;
        letter-spacing: 2px;
        ">${otp}</span>
    </div>
    <p style="
        font-size: 14px; 
        color: #777777;
    ">
        This OTP will expire in <strong>10 minutes</strong>.
    </p>
    <p style="
        font-size: 14px; 
        color: #777777;
    ">
        If you did not request this email, please ignore it.
    </p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="
        font-size: 12px; 
        color: #aaaaaa; 
        text-align: center;
    ">
        &copy; ${new Date().getFullYear()} Diet and Wellness. All rights reserved.
    </p>
    </div>
`;
