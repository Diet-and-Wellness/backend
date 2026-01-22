import { validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const validation_result = validationResult(req);
  if (!validation_result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: validation_result
        .array()
        .map((err) => err.msg)
        .join(", "),
    });
  }
  next();
};

export default handleValidationErrors;
