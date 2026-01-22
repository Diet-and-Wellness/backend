import User from "#models/user.js";
import Otp from "#models/otp.js";

import generateOTP from "#utils/otp.js";
import jwt from "#utils/jwt.js";
import sendEmail from "#utils/email.js";
import { otpEmailTemplate } from "#utils/emailTemplates.js";

const sendOtp = async ({ email }) => {
  // Delete any existing OTP for this user
  await Otp.deleteMany({ email, purpose: "verify_account" });

  const otp = generateOTP();

  await Otp.create({
    email,
    code: otp,
    purpose: "verify_account",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // send email
  await sendEmail({
    to: email,
    subject: "Verify Your Email - OTP Code",
    html: otpEmailTemplate(otp),
  });

  return { message: "OTP sent to email", email };
};

const verifyOtp = async ({ email, code }) => {
  const otp = await Otp.findOne({
    email,
    code,
    purpose: "verify_account",
    expiresAt: { $gt: new Date() },
  });

  if (!otp) throw new Error("Invalid or expired OTP");

  // Mark OTP as verified
  otp.verified = true;
  otp.expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
  await otp.save();

  return { message: "Email verified successfully" };
};

const signup = async ({ firstName, lastName, email, password, phone }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already exists");

  const existsPhone = await User.findOne({ phone });
  if (existsPhone) throw new Error("Phone number already exists");

  const otp = await Otp.findOne({
    email,
    purpose: "verify_account",
    verified: true,
  });
  if (!otp) throw new Error("Please verify your email first");

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    passwordHash: password,
  });

  await Otp.deleteMany({ email, purpose: "verify_account" });

  return user.toJSON();
};

const login = async ({ email, phone, password }) => {
  const identifier = email || phone;
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
  if (!user) throw new Error("Invalid credentials");

  const match = await user.comparePassword(password);
  if (!match) throw new Error("Invalid credentials");

  const refreshToken = jwt.signRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save();

  const accessToken = jwt.signAccessToken({
    id: user._id,
    role: user.role,
  });
  return { accessToken, refreshToken };
};

const refreshToken = async ({ refreshToken }) => {
  const payload = jwt.verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.user_id);

  console.log(user, payload, refreshToken);
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = jwt.signAccessToken({
    id: user._id,
    role: user.role,
  });

  return { accessToken };
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email not found");

  const otp = generateOTP();

  await Otp.create({
    email,
    code: otp,
    purpose: "reset_password",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // send email
  await sendEmail({
    to: email,
    subject: "Reset Your Password - OTP Code",
    html: otpEmailTemplate(otp, "reset_password"),
  });

  return { message: "OTP sent to email", email };
};

const resetPassword = async ({ email, code, password }) => {
  const otp = await Otp.findOne({
    email,
    code,
    purpose: "reset_password",
    expiresAt: { $gt: new Date() },
  });

  if (!otp) throw new Error("Invalid or expired OTP");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  user.passwordHash = password;
  await user.save();

  await Otp.deleteMany({ email, purpose: "reset_password" });

  return { message: "Password reset successfully" };
};

const logout = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};

export default {
  signup,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
};
