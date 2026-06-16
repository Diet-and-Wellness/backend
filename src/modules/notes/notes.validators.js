import { body, param, query } from "express-validator";

const createNote = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "content" }]),
  body("customer_id")
    .notEmpty()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "customer_id" }]),
  body("attachments")
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "attachments" }]),
];

const bulkCreate = [
  body("notes")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "notes" }])
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "notes" }]),
];

const getNotes = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER"]),
  query("customer_id")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "customer_id" }]),
];

const getLastNoteForCustomer = [
  query("customer_id")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "customer_id" }]),
];

const noteId = [
  param("noteId")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "noteId" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "noteId" }]),
];

const updateNote = [
  param("noteId")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "noteId" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "noteId" }]),
  body("content")
    .optional()
    .isLength({ min: 1 })
    .withMessage(["INVALID_LENGTH", { field: "content", min: 1 }]),
  body("attachments")
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "attachments" }]),
];

export default {
  createNote,
  bulkCreate,
  getNotes,
  getLastNoteForCustomer,
  noteId,
  updateNote,
};
