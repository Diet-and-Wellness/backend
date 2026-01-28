import { getLanguage, translate } from "#utils/localization.js";
import authService from "./auth.service.js";

const sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body);
    res.json({
      message: translate("OTP_SENT_SUCCESS", getLanguage(req)),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json({
      message: translate("OTP_VERIFIED_SUCCESS", getLanguage(req)),
    });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.user_id);
    res.json({ message: translate("LOGOUT_SUCCESS", getLanguage(req)) });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json({
      message: translate("OTP_SENT_SUCCESS", getLanguage(req)),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({
      message: translate("PASSWORD_RESET_SUCCESS", getLanguage(req)),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  login,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
