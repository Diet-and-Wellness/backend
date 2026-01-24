const ensureRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error("Access denied");
      err.status = 403;
      throw err;
    }
    next();
  };
};

export { ensureRoles };
