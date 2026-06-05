import sendEmail from "#utils/email.js";
import { contactUsEmailTemplate } from "#utils/emailTemplates.js";
import env from "#config/env.js";

const sendContactUsEmail = async ({ name, email, message, phone }) => {
  sendEmail({
    to: env.contactUsEmail,
    subject: "Contact Us Message",
    html: contactUsEmailTemplate({ name, email, message, phone }),
  });

  return true;
};

export default {
  sendContactUsEmail,
};
