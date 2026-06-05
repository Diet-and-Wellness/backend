import { body } from "express-validator";

// Contact Us form submission validator
const submitContactUs = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "name" }])
    .isLength({ min: 2, max: 100 })
    .withMessage(["INVALID_LENGTH", { field: "name", min: 2, max: 100 }]),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "email" }])
    .isEmail()
    .withMessage(["INVALID_EMAIL", { field: "email" }]),
  body("message")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "message" }])
    .isLength({ min: 10, max: 2000 })
    .withMessage(["INVALID_LENGTH", { field: "message", min: 10, max: 2000 }]),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage(["INVALID_PHONE_FORMAT"]),
];

export default {
  submitContactUs,
};
