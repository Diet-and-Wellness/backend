import { getLanguage, translate, ERROR_CODES } from "#utils/localization.js";

const ensureRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error(
        translate(ERROR_CODES.INSUFFICIENT_PERMISSIONS, getLanguage(req)),
      );
      err.status = 403;
      err.code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      return next(err);
    }
    next();
  };
};

export { ensureRoles };
