import {
  serializeManyWithUserReferences,
  serializeWithUserReferences,
} from "./related-user.serializer.js";

export const serializeFeedback = (feedback) => {
  return serializeWithUserReferences(feedback);
};

export const serializeFeedbacks = (feedbacks = []) =>
  serializeManyWithUserReferences(feedbacks);
