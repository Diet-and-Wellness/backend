import * as service from "./assessments.service.js";
import { translate, ERROR_CODES } from "#utils/localization.js";

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Form
// ─────────────────────────────────────────────────────────────────────────────

export const createForm = async (req, res, next) => {
  try {
    const form = await service.createForm(req.body, req.user.user_id);
    res.status(201).json({ success: true, data: form });
  } catch (err) {
    next(err);
  }
};

export const listForms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await service.listForms(page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getForm = async (req, res, next) => {
  try {
    const form = await service.getFormById(req.params.formId);
    res.json({ success: true, data: form });
  } catch (err) {
    next(err);
  }
};

export const updateForm = async (req, res, next) => {
  try {
    const form = await service.updateForm(req.params.formId, req.body);
    res.json({ success: true, data: form });
  } catch (err) {
    next(err);
  }
};

export const activateForm = async (req, res, next) => {
  try {
    const form = await service.activateForm(req.params.formId);
    res.json({ success: true, data: form });
  } catch (err) {
    next(err);
  }
};

export const deleteForm = async (req, res, next) => {
  try {
    await service.deleteForm(req.params.formId);
    res.json({
      success: true,
      message: translate(ERROR_CODES.ASSESSMENT_FORM_DELETED, req.language),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Section
// ─────────────────────────────────────────────────────────────────────────────

export const addSection = async (req, res, next) => {
  try {
    const section = await service.addSection(req.params.formId, req.body);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const section = await service.updateSection(req.params.sectionId, req.body);
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

export const replaceSectionResultRanges = async (req, res, next) => {
  try {
    const section = await service.replaceSectionResultRanges(
      req.params.sectionId,
      req.body.resultRanges,
    );
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    await service.deleteSection(req.params.sectionId);
    res.json({
      success: true,
      message: translate(ERROR_CODES.ASSESSMENT_SECTION_DELETED, req.language),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Question
// ─────────────────────────────────────────────────────────────────────────────

export const addQuestion = async (req, res, next) => {
  try {
    const section = await service.addQuestion(req.params.sectionId, req.body);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const section = await service.updateQuestion(
      req.params.sectionId,
      req.params.questionId,
      req.body,
    );
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const section = await service.deleteQuestion(
      req.params.sectionId,
      req.params.questionId,
    );
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin / Specialist — Submissions
// ─────────────────────────────────────────────────────────────────────────────

export const listSubmissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const formId = req.query.formId || null;
    const dateFrom = req.query.dateFrom || null;
    const dateTo = req.query.dateTo || null;
    const result = await service.listSubmissions(
      page,
      limit,
      formId,
      dateFrom,
      dateTo,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getUserSubmission = async (req, res, next) => {
  try {
    const submission = await service.getUserSubmission(
      req.params.userId,
      req.user,
    );
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Customer — Assessment
// ─────────────────────────────────────────────────────────────────────────────

export const getActiveForm = async (req, res, next) => {
  try {
    const form = await service.getActiveForm(req.language);
    res.json({ success: true, data: form });
  } catch (err) {
    next(err);
  }
};

export const getActiveFormSection = async (req, res, next) => {
  try {
    const section = await service.getActiveFormSection(
      req.params.sectionId,
      req.language,
    );
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

export const submitSection = async (req, res, next) => {
  try {
    const { sectionResult, submission } = await service.submitSection(
      req.user.user_id,
      req.params.sectionId,
      req.body.answers,
      req.language,
    );
    res.json({
      success: true,
      data: {
        sectionResult,
        status: submission.status,
        totalScore: submission.totalScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const finalizeSubmission = async (req, res, next) => {
  try {
    const submission = await service.finalizeSubmission(
      req.user.user_id,
      req.language,
    );
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const submitAll = async (req, res, next) => {
  try {
    const submission = await service.submitAll(
      req.user.user_id,
      req.body.formId,
      req.body.sections,
      req.language,
    );
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const getOwnResult = async (req, res, next) => {
  try {
    const submission = await service.getOwnResult(
      req.user.user_id,
      req.language,
    );
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const progress = await service.getProgress(req.user.user_id, req.language);
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};
