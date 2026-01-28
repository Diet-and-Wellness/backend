import { getLanguage, translate, ERROR_CODES } from "#utils/localization.js";

const ensureRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error(
        translate(ERROR_CODES.UNAUTHORIZED_ACCESS, getLanguage(req)),
      );
      err.status = 403;
      err.code = ERROR_CODES.UNAUTHORIZED_ACCESS;
      throw err;
    }
    next();
  };
};

export { ensureRoles };
