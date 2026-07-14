import Note from "#models/note.js";
import { serializeDocument } from "./base.serializer.js";

const getId = (user) => String(user?._id ?? user?.id ?? "");

const getRawUser = (user) =>
  typeof user?.toObject === "function" ? user.toObject() : user;

const getCustomerWeight = (user) => {
  const rawUser = getRawUser(user);
  const weightHistory = [...(rawUser.profile?.weightHistory ?? [])];
  const startRecord = weightHistory[0];
  const currentWeight =
    rawUser.profile?.currentWeight ?? weightHistory.at(-1)?.weight;
  const currentRecord = [...weightHistory]
    .reverse()
    .find((record) => record.weight === currentWeight);

  return {
    current:
      currentWeight !== undefined
        ? {
            weight: currentWeight,
            date: currentRecord?.date ?? rawUser.updatedAt ?? null,
          }
        : null,
    start:
      startRecord || currentWeight !== undefined
        ? {
            weight: startRecord?.weight ?? currentWeight,
            date: startRecord?.date ?? rawUser.createdAt ?? null,
          }
        : null,
  };
};

const serializeLastNote = (note) => {
  const serialized = serializeDocument(note);
  if (note.populated?.("writer")) {
    serialized.writer = serializeUserSummary(note.writer);
  }
  return serialized;
};

export const serializeUserSummary = (user) => {
  if (!user) return null;

  const serialized = serializeDocument(user);
  delete serialized.profile;
  delete serialized.weight;
  delete serialized.lastNote;

  return serialized;
};

/**
 * Serialize full user responses. Customer-only response fields are added here;
 * admins and specialists retain their existing role-specific response shape.
 */
export const serializeUsers = async (users) => {
  const userList = users.filter(Boolean);
  const customerIds = userList
    .filter((user) => user.role === "customer")
    .map((user) => user._id);

  const latestNotesByCustomer = new Map();

  if (customerIds.length > 0) {
    const latestNoteData = await Note.aggregate([
      {
        $match: {
          customer: { $in: customerIds },
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$customer",
          note: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$note" } },
    ]);
    const notes = latestNoteData.map((note) => Note.hydrate(note));
    await Note.populate(notes, {
      path: "writer",
      select: "firstName lastName email role",
    });

    for (const note of notes) {
      latestNotesByCustomer.set(String(note.customer), serializeLastNote(note));
    }
  }

  return userList.map((user) => {
    const serialized = serializeDocument(user);
    if (
      typeof user.populated === "function" &&
      user.populated("specialist")
    ) {
      serialized.specialist = serializeUserSummary(user.specialist);
    }

    if (user.role !== "customer") {
      delete serialized.profile;
      delete serialized.weight;
      delete serialized.lastNote;
      return serialized;
    }

    serialized.profile ??= {};
    serialized.profile.weightHistory ??= [];
    serialized.weight = getCustomerWeight(user);
    serialized.lastNote = latestNotesByCustomer.get(getId(user)) ?? null;
    return serialized;
  });
};

export const serializeUser = async (user) => {
  if (!user) return null;
  const [serialized] = await serializeUsers([user]);
  return serialized;
};
