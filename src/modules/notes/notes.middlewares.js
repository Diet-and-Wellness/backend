import Note from "#models/note.js";

export const checkNoteExists = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note || note.isDeleted) {
    return res.status(404).json({ message: "note not found" });
  }
  req.note = note;
  next();
};
