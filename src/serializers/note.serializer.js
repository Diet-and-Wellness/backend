import {
  serializeManyWithUserReferences,
  serializeWithUserReferences,
} from "./related-user.serializer.js";

export const serializeNote = (note) => {
  return serializeWithUserReferences(note, ["customer", "writer"]);
};

export const serializeNotes = (notes = []) =>
  serializeManyWithUserReferences(notes, ["customer", "writer"]);
