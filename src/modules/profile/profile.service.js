import User from "#models/user.js";
import { ERROR_CODES, translate, getLanguage } from "#utils/localization.js";

// Get user's own profile
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  return user;
};

// Search and filter profiles (admin/specialists only)
const searchProfiles = async (query, requesterRole) => {
  const filters = {};

  // Search by name (firstName or lastName)
  if (query.firstName) {
    filters.firstName = { $regex: query.firstName, $options: "i" };
  }
  if (query.lastName) {
    filters.lastName = { $regex: query.lastName, $options: "i" };
  }
  if (query.email) {
    filters.email = { $regex: query.email, $options: "i" };
  }
  if (query.phone) {
    filters.phone = { $regex: query.phone, $options: "i" };
  }
  // Filter by role
  if (query.role) {
    filters.role = query.role;
  }
  // Filter by specialist status (if role is specialist)
  if (query.specialistStatus) {
    filters["specialistInfo.status"] = query.specialistStatus;
  }
  // Filter by specialization
  if (query.specialization) {
    filters["specialistInfo.specialization"] = {
      $regex: query.specialization,
      $options: "i",
    };
  }

  const skip = (query.page - 1) * query.limit || 0;
  const limit = query.limit || 10;

  const users = await User.find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filters);

  return {
    data: users,
    pagination: {
      total,
      page: query.page || 1,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Update user profile
const updateProfile = async (userId, updateData) => {
  // Prevent updating sensitive fields
  const allowedFields = ["firstName", "lastName", "phone"];

  // If user is specialist, allow updating specialist info
  const user = await User.findById(userId);
  if (user?.role === "specialist" && updateData.specialistInfo) {
    allowedFields.push("specialistInfo");
  }

  const filteredData = {};
  if (updateData) {
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  return updatedUser;
};

// Admin: Create specialist profile
const createSpecialistProfile = async (specialistData, requesterRole) => {
  const exists = await User.findOne({ email: specialistData.email });
  if (exists) {
    const error = new Error(translate(ERROR_CODES.EMAIL_ALREADY_EXISTS, "en"));
    error.code = ERROR_CODES.EMAIL_ALREADY_EXISTS;
    error.status = 409;
    throw error;
  }

  const specialist = await User.create({
    firstName: specialistData.firstName,
    lastName: specialistData.lastName,
    email: specialistData.email,
    phone: specialistData.phone,
    passwordHash: specialistData.password,
    role: "specialist",
    specialistInfo: {
      specialization: specialistData.specialization,
      experienceYears: specialistData.experienceYears,
      status: "inactive", // Newly created specialists start inactive
    },
  });

  return specialist;
};

// Admin: Activate specialist
const activateSpecialist = async (specialistId, requesterRole) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) {
    const error = new Error(translate(ERROR_CODES.SPECIALIST_NOT_FOUND, "en"));
    error.code = ERROR_CODES.SPECIALIST_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  if (specialist.role !== "specialist") {
    const error = new Error(translate(ERROR_CODES.USER_NOT_SPECIALIST, "en"));
    error.code = ERROR_CODES.USER_NOT_SPECIALIST;
    error.status = 400;
    throw error;
  }

  specialist.specialistInfo.status = "active";
  await specialist.save();

  return specialist;
};

// Admin: Deactivate specialist
const deactivateSpecialist = async (specialistId, requesterRole) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) {
    const error = new Error(translate(ERROR_CODES.SPECIALIST_NOT_FOUND, "en"));
    error.code = ERROR_CODES.SPECIALIST_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  if (specialist.role !== "specialist") {
    const error = new Error(translate(ERROR_CODES.USER_NOT_SPECIALIST, "en"));
    error.code = ERROR_CODES.USER_NOT_SPECIALIST;
    error.status = 400;
    throw error;
  }

  specialist.specialistInfo.status = "inactive";
  await specialist.save();

  return specialist;
};

// Admin: Assign one or more customers to a specialist
const assignCustomersToSpecialist = async (specialistId, customerIds) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) {
    const error = new Error(translate(ERROR_CODES.SPECIALIST_NOT_FOUND, "en"));
    error.code = ERROR_CODES.SPECIALIST_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  if (specialist.role !== "specialist") {
    const error = new Error(translate(ERROR_CODES.USER_NOT_SPECIALIST, "en"));
    error.code = ERROR_CODES.USER_NOT_SPECIALIST;
    error.status = 400;
    throw error;
  }

  // Validate all provided IDs are customers
  const customers = await User.find({
    _id: { $in: customerIds },
    role: "customer",
  }).select("_id");

  if (customers.length !== customerIds.length) {
    const error = new Error(translate(ERROR_CODES.INVALID_CUSTOMER_IDS, "en"));
    error.code = ERROR_CODES.INVALID_CUSTOMER_IDS;
    error.status = 400;
    throw error;
  }

  // Assign all customers to the specialist
  await User.updateMany(
    { _id: { $in: customerIds } },
    { specialist: specialistId },
  );

  return { assignedCount: customerIds.length };
};

const deleteProfile = async (userId, requesterRole) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }

  await user.deleteOne();
  return true;
};

export default {
  getProfile,
  searchProfiles,
  updateProfile,
  createSpecialistProfile,
  deleteProfile,
  activateSpecialist,
  deactivateSpecialist,
  assignCustomersToSpecialist,
};
