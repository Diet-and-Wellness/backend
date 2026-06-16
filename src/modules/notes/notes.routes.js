import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import controller from "./notes.controller.js";
import validators from "./notes.validators.js";
import { checkNoteExists } from "./notes.middlewares.js";
import { standardLimiter, relaxedLimiter } from "#middlewares/rateLimiter.js";

const router = express.Router();

// Create a note (admin or specialist)
router.post(
  "/",
  authenticate,
  relaxedLimiter,
  ensureRoles(["admin", "specialist"]),
  validators.createNote,
  handleValidationErrors,
  controller.createNote,
);

// Bulk create notes
router.post(
  "/bulk",
  authenticate,
  relaxedLimiter,
  ensureRoles(["admin", "specialist"]),
  validators.bulkCreate,
  handleValidationErrors,
  controller.createNotesBulk,
);

// List notes (admin, specialist, or customer for own notes)
router.get(
  "/",
  authenticate,
  standardLimiter,
  validators.getNotes,
  handleValidationErrors,
  controller.getNotes,
);

// Get last note for a customer (customer sees own, admin/specialist specify customer ID)
router.get(
  "/last",
  authenticate,
  standardLimiter,
  validators.getLastNoteForCustomer,
  handleValidationErrors,
  controller.getLastNoteForCustomer,
);

// Get customer note history (customer sees own notes, admin/specialist specify customer ID)
// router.get(
//   "/history",
//   authenticate,
//   standardLimiter,
//   validators.getNotes,
//   handleValidationErrors,
//   controller.getNoteHistory,
// );

// Get note by ID
router.get(
  "/:noteId",
  authenticate,
  standardLimiter,
  validators.noteId,
  handleValidationErrors,
  checkNoteExists,
  controller.getNoteById,
);

// Update note (admin or original writer)
router.put(
  "/:noteId",
  authenticate,
  standardLimiter,
  validators.updateNote,
  handleValidationErrors,
  checkNoteExists,
  controller.updateNote,
);

// Delete note (admin or original writer)
router.delete(
  "/:noteId",
  authenticate,
  standardLimiter,
  validators.noteId,
  handleValidationErrors,
  checkNoteExists,
  controller.deleteNote,
);

export default router;
