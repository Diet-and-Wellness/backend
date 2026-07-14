import { serializeDocument } from "./base.serializer.js";
import { serializeUserSummary } from "./user.serializer.js";

export const serializeWithUserReferences = (
  document,
  userFields = ["user"],
) => {
  if (!document) return null;

  const serialized = serializeDocument(document);
  for (const field of userFields) {
    if (
      typeof document.populated === "function" &&
      document.populated(field)
    ) {
      serialized[field] = serializeUserSummary(document[field]);
    }
  }

  return serialized;
};

export const serializeManyWithUserReferences = (
  documents = [],
  userFields = ["user"],
) =>
  documents.map((document) =>
    serializeWithUserReferences(document, userFields),
  );
