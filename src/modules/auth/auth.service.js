import User from "#models/user.js";
import Otp from "#models/otp.js";

import generateOTP from "#utils/otp.js";
import jwt from "#utils/jwt.js";
import sendEmail from "#utils/email.js";
import { otpEmailTemplate } from "#utils/emailTemplates.js";
import { ERROR_CODES, translate } from "#utils/localization.js";

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

  return email;
};

const verifyOtp = async ({ email, code }) => {
  const otp = await Otp.findOne({
    email,
    code,
    purpose: "verify_account",
    expiresAt: { $gt: new Date() },
  });

  if (!otp) {
    const error = new Error(translate(ERROR_CODES.OTP_INVALID, "en"));
    error.code = ERROR_CODES.OTP_INVALID;
    error.status = 400;
    throw error;
  }

  // Mark OTP as verified
  otp.verified = true;
  otp.expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
  await otp.save();

  return true;
};

const signup = async ({ firstName, lastName, email, password, phone }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const error = new Error(translate(ERROR_CODES.EMAIL_ALREADY_EXISTS, "en"));
    error.code = ERROR_CODES.EMAIL_ALREADY_EXISTS;
    error.status = 409;
    throw error;
  }

  const existsPhone = await User.findOne({ phone });
  if (existsPhone) {
    const error = new Error(translate(ERROR_CODES.PHONE_ALREADY_EXISTS, "en"));
    error.code = ERROR_CODES.PHONE_ALREADY_EXISTS;
    error.status = 409;
    throw error;
  }

  const otp = await Otp.findOne({
    email,
    purpose: "verify_account",
    verified: true,
  });
  if (!otp) {
    const error = new Error(translate(ERROR_CODES.EMAIL_NOT_VERIFIED, "en"));
    error.code = ERROR_CODES.EMAIL_NOT_VERIFIED;
    error.status = 400;
    throw error;
  }

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
  }).select("+passwordHash");
  if (!user) {
    const error = new Error(translate(ERROR_CODES.INVALID_CREDENTIALS, "en"));
    error.code = ERROR_CODES.INVALID_CREDENTIALS;
    error.status = 401;
    throw error;
  }

  const match = await user.comparePassword(password);
  if (!match) {
    const error = new Error(translate(ERROR_CODES.INVALID_CREDENTIALS, "en"));
    error.code = ERROR_CODES.INVALID_CREDENTIALS;
    error.status = 401;
    throw error;
  }

  const refreshToken = jwt.signRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save();

  const accessToken = jwt.signAccessToken({
    id: user._id,
    role: user.role,
  });

  if (user.role === "specialist") {
    user.assignedCustomersCount = await User.countDocuments({
      specialist: user._id,
    });
  }

  return {
    accessToken,
    refreshToken,
    user: {
      ...user.toJSON(),
      assignedCustomersCount: user.assignedCustomersCount,
    },
  };
};

const refreshToken = async (token) => {
  const payload = jwt.verifyRefreshToken(token);

  const user = await User.findById(payload.user_id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    const error = new Error(translate(ERROR_CODES.INVALID_REFRESH_TOKEN, "en"));
    error.code = ERROR_CODES.INVALID_REFRESH_TOKEN;
    error.status = 401;
    throw error;
  }

  // Rotate: issue a new refresh token so the old one is invalidated.
  // This limits the damage window if a refresh token is stolen.
  const newAccessToken = jwt.signAccessToken({
    id: user._id,
    role: user.role,
  });
  const newRefreshToken = jwt.signRefreshToken({ id: user._id });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: user.toJSON(),
  };
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error(translate(ERROR_CODES.EMAIL_NOT_FOUND, "en"));
    error.code = ERROR_CODES.EMAIL_NOT_FOUND;
    error.status = 404;
    throw error;
  }

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

  return email;
};

const resetPassword = async ({ email, code, password }) => {
  const otp = await Otp.findOne({
    email,
    code,
    purpose: "reset_password",
    expiresAt: { $gt: new Date() },
  });

  if (!otp) {
    const error = new Error(translate(ERROR_CODES.OTP_INVALID, "en"));
    error.code = ERROR_CODES.OTP_INVALID;
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }

  user.passwordHash = password;
  await user.save();

  await Otp.deleteMany({ email, purpose: "reset_password" });

  return true;
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
