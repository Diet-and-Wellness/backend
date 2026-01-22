import nodemailer from "nodemailer";
import env from "#config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.mailFrom,
    pass: env.googleAppPassword,
  },
});

const sendEmail = ({ to, subject, html }) => {
  return transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    html,
  });
};

export default sendEmail;
