export const serializeDocument = (document) => {
  if (document === null || document === undefined) return document;
  return typeof document.toJSON === "function"
    ? document.toJSON()
    : { ...document };
};

export const serializeDocuments = (documents = []) =>
  documents.map(serializeDocument);

export const serializePaginated = (
  result,
  itemSerializer = serializeDocument,
) => ({
  ...result,
  data: (result.data ?? []).map(itemSerializer),
});
