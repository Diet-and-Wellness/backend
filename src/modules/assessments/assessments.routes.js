import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import { standardLimiter, relaxedLimiter } from "#middlewares/rateLimiter.js";
import validators from "./assessments.validators.js";
import * as controller from "./assessments.controller.js";
import { attachResultsAccess } from "#middlewares/subscription.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES — must come before customer routes
// ─────────────────────────────────────────────────────────────────────────────

// Forms
router.post(
  "/admin/forms",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.createForm,
  handleValidationErrors,
  controller.createForm,
);

router.get(
  "/admin/forms",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.pagination,
  handleValidationErrors,
  controller.listForms,
);

router.get(
  "/admin/forms/:formId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.formId,
  handleValidationErrors,
  controller.getForm,
);

router.put(
  "/admin/forms/:formId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.formId,
  validators.updateForm,
  handleValidationErrors,
  controller.updateForm,
);

router.patch(
  "/admin/forms/:formId/activate",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.formId,
  handleValidationErrors,
  controller.activateForm,
);

router.delete(
  "/admin/forms/:formId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.formId,
  handleValidationErrors,
  controller.deleteForm,
);

// Sections (under a form)
router.post(
  "/admin/forms/:formId/sections",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.formId,
  validators.createSection,
  handleValidationErrors,
  controller.addSection,
);

// Sections (standalone by sectionId)
router.put(
  "/admin/sections/:sectionId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.sectionId,
  validators.updateSection,
  handleValidationErrors,
  controller.updateSection,
);

router.put(
  "/admin/sections/:sectionId/result-ranges",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.sectionId,
  validators.replaceSectionResultRanges,
  handleValidationErrors,
  controller.replaceSectionResultRanges,
);

router.delete(
  "/admin/sections/:sectionId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.sectionId,
  handleValidationErrors,
  controller.deleteSection,
);

// Questions
router.post(
  "/admin/sections/:sectionId/questions",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.sectionId,
  validators.addQuestion,
  handleValidationErrors,
  controller.addQuestion,
);

router.put(
  "/admin/sections/:sectionId/questions/:questionId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.sectionId,
  validators.questionId,
  validators.updateQuestion,
  handleValidationErrors,
  controller.updateQuestion,
);

router.delete(
  "/admin/sections/:sectionId/questions/:questionId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.sectionId,
  validators.questionId,
  handleValidationErrors,
  controller.deleteQuestion,
);

// Submissions (admin + specialist)
router.get(
  "/admin/submissions",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.submissionsFilter,
  handleValidationErrors,
  controller.listSubmissions,
);

router.get(
  "/admin/submissions/:userId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin", "specialist"]),
  validators.userId,
  handleValidationErrors,
  controller.getUserSubmission,
);

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Get the active form (structure only, no scores)
router.get(
  "/form",
  authenticate,
  relaxedLimiter,
  //   ensureRoles(["customer"]),
  controller.getActiveForm,
);

// Get a single section of the active form (for section-by-section UX)
router.get(
  "/form/sections/:sectionId",
  authenticate,
  relaxedLimiter,
  //   ensureRoles(["customer"]),
  validators.sectionId,
  handleValidationErrors,
  controller.getActiveFormSection,
);

// Get progress on an in-progress submission
router.get(
  "/progress",
  authenticate,
  relaxedLimiter,
  ensureRoles(["customer"]),
  controller.getProgress,
);

// Submit answers for a single section (section-by-section flow)
router.post(
  "/sections/:sectionId/submit",
  authenticate,
  standardLimiter,
  ensureRoles(["customer"]),
  validators.sectionId,
  validators.sectionAnswers,
  handleValidationErrors,
  controller.submitSection,
);

// Finalize an in-progress submission
router.post(
  "/finalize",
  authenticate,
  standardLimiter,
  ensureRoles(["customer"]),
  controller.finalizeSubmission,
);

// Full one-shot submission (all sections at once)
router.post(
  "/submit",
  authenticate,
  standardLimiter,
  ensureRoles(["customer"]),
  validators.submitAllSections,
  handleValidationErrors,
  controller.submitAll,
);

// Get own completed result
router.get(
  "/result",
  authenticate,
  relaxedLimiter,
  ensureRoles(["customer"]),
  attachResultsAccess,
  controller.getOwnResult,
);

export default router;
