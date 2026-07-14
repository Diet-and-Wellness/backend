import Note from "#models/note.js";
import { ERROR_CODES, translate } from "#utils/localization.js";
import {
  serializeNote,
  serializeNotes,
} from "#serializers/note.serializer.js";

const createNote = async (noteData) => {
  try {
    const requiredFields = ["content", "customer_id", "writer", "attachments"];
    for (const field of requiredFields) {
      if (!noteData[field]) {
        const err = new Error(
          translate(ERROR_CODES.REQUIRED_FIELD, "en", { field }),
        );
        err.code = ERROR_CODES.REQUIRED_FIELD;
        err.status = 400;
        throw err;
      }
    }
    const note = new Note({
      content: noteData.content,
      customer: noteData.customer_id,
      writer: noteData.writer,
      attachments: noteData.attachments,
    });
    await note.save();
    await note.populate("customer", "firstName lastName email role");
    await note.populate("writer", "firstName lastName email role");
    return serializeNote(note);
  } catch (error) {
    throw error;
  }
};

const createNotesBulk = async (notesArray) => {
  try {
    if (!Array.isArray(notesArray) || notesArray.length === 0) {
      const err = new Error(
        translate(ERROR_CODES.INVALID_ARRAY, "en", { field: "notes" }),
      );
      err.code = ERROR_CODES.INVALID_ARRAY;
      err.status = 400;
      throw err;
    }

    const docs = notesArray.map((n) => ({ ...n }));
    const result = await Note.insertMany(docs);
    // populate returned docs (simple approach)
    await Promise.all(
      result.map((d) =>
        d.populate("customer", "firstName lastName email role"),
      ),
    );
    await Promise.all(
      result.map((d) => d.populate("writer", "firstName lastName email role")),
    );
    return serializeNotes(result);
  } catch (error) {
    throw error;
  }
};

const getNotes = async (filters = {}, requester = {}) => {
  const { page = 1, limit = 10, customer_id } = filters;
  const requesterId = requester.user_id || requester.id || requester._id;
  let customerId = customer_id;

  if (requester.role === "customer") {
    customerId = requesterId;
    if (customer_id && String(customer_id) !== String(requesterId)) {
      const err = new Error(
        translate(ERROR_CODES.INSUFFICIENT_PERMISSIONS, "en"),
      );
      err.code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      err.status = 403;
      throw err;
    }
  }

  if (!customerId) {
    const err = new Error(
      translate(ERROR_CODES.MISSING_FIELD, "en", { field: "customer_id" }),
    );
    err.code = ERROR_CODES.MISSING_FIELD;
    err.status = 400;
    throw err;
  }

  try {
    const query = {
      customer: customerId,
      isDeleted: false,
    };
    const skip = (page - 1) * limit;

    const [notes, totalCount] = await Promise.all([
      Note.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("customer", "firstName lastName email role")
        .populate("writer", "firstName lastName email role"),
      Note.countDocuments(query),
    ]);

    return {
      data: serializeNotes(notes),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getLastNoteForCustomer = async (customerId, requester = {}) => {
  try {
    if (requester.role === "customer") {
      customerId = requester.user_id || requester.id || requester._id;
    }
    if (!customerId) {
      const err = new Error(
        translate(ERROR_CODES.MISSING_FIELD, "en", { field: "customer_id" }),
      );
      err.code = ERROR_CODES.MISSING_FIELD;
      err.status = 400;
      err.params = { field: "customer_id" };
      throw err;
    }

    const note = await Note.findOne({ customer: customerId, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("customer", "firstName lastName email role")
      .populate("writer", "firstName lastName email role");
    return serializeNote(note);
  } catch (error) {
    throw error;
  }
};

const getNoteById = async (noteId) => {
  try {
    const note = await Note.findOne({ _id: noteId, isDeleted: false })
      .populate("customer", "firstName lastName email role")
      .populate("writer", "firstName lastName email role");

    if (!note) {
      const err = new Error(translate(ERROR_CODES.NOTE_NOT_FOUND, "en"));
      err.code = ERROR_CODES.NOTE_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    return serializeNote(note);
  } catch (error) {
    throw error;
  }
};

const updateNote = async (noteId, updateData, requester = {}) => {
  try {
    const note = await Note.findById(noteId);
    if (!note || note.isDeleted) {
      const err = new Error(translate(ERROR_CODES.NOTE_NOT_FOUND, "en"));
      err.code = ERROR_CODES.NOTE_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    // Only admin or original writer can update
    if (
      requester.role !== "admin" &&
      String(note.writer) !==
        String(requester.user_id || requester.id || requester._id)
    ) {
      const err = new Error(
        translate(ERROR_CODES.INSUFFICIENT_PERMISSIONS, "en"),
      );
      err.code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      err.status = 403;
      throw err;
    }

    if (updateData.content !== undefined) note.content = updateData.content;
    if (updateData.attachments !== undefined)
      note.attachments = updateData.attachments;

    await note.save();
    await note.populate("customer", "firstName lastName email role");
    await note.populate("writer", "firstName lastName email role");
    return serializeNote(note);
  } catch (error) {
    throw error;
  }
};

const deleteNote = async (noteId, requester = {}) => {
  try {
    const note = await Note.findById(noteId);
    if (!note || note.isDeleted) {
      const err = new Error(translate(ERROR_CODES.NOTE_NOT_FOUND, "en"));
      err.code = ERROR_CODES.NOTE_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    // Only admin or original writer can delete
    if (
      requester.role !== "admin" &&
      String(note.writer) !==
        String(requester.user_id || requester.id || requester._id)
    ) {
      const err = new Error(
        translate(ERROR_CODES.INSUFFICIENT_PERMISSIONS, "en"),
      );
      err.code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      err.status = 403;
      throw err;
    }

    note.isDeleted = true;
    await note.save();
    return true;
  } catch (error) {
    throw error;
  }
};

export default {
  createNote,
  createNotesBulk,
  getNotes,
  getLastNoteForCustomer,
  getNoteById,
  updateNote,
  deleteNote,
};
