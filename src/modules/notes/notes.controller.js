import notesService from "./notes.service.js";
import { getLanguage, translate, getFieldName } from "#utils/localization.js";

const createNote = async (req, res, next) => {
  try {
    const noteData = {
      content: req.body.content,
      customer_id: req.body.customer_id,
      writer: req.user.user_id || req.user.id || req.user._id,
      attachments: req.body.attachments || [],
    };

    const note = await notesService.createNote(noteData);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const createNotesBulk = async (req, res, next) => {
  try {
    const items = req.body.notes;
    // Attach writer for each
    const prepared = items.map((i) => ({
      ...i,
      writer: req.user.user_id || req.user.id || req.user._id,
    }));

    const result = await notesService.createNotesBulk(prepared);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      customer_id: req.query.customer_id,
    };

    const result = await notesService.getNotes(filters, req.user || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getLastNoteForCustomer = async (req, res, next) => {
  try {
    const customerId = req.query.customer_id || req.params.customer_id;
    const note = await notesService.getLastNoteForCustomer(
      customerId,
      req.user || {},
    );
    res.json(note);
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const result = await notesService.getNoteById(req.params.noteId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const updateData = {
      ...(req.body?.content !== undefined && { content: req.body.content }),
      ...(req.body?.attachments !== undefined && {
        attachments: req.body.attachments,
      }),
    };

    const result = await notesService.updateNote(
      req.params.noteId,
      updateData,
      req.user || {},
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    await notesService.deleteNote(req.params.noteId, req.user || {});
    res.json({
      message: translate("DELETE_SUCCESS", getLanguage(req), {
        item: getFieldName("note", getLanguage(req)),
      }),
    });
  } catch (error) {
    next(error);
  }
};

const getNoteHistory = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      customer_id: req.query.customer_id,
    };

    const history = await notesService.getNoteHistory(filters, req.user || {});
    res.json(history);
  } catch (error) {
    next(error);
  }
};

export default {
  createNote,
  createNotesBulk,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getLastNoteForCustomer,
  getNoteHistory,
};
