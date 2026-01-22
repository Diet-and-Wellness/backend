import User from "#models/user.js";

// Get user's own profile
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
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

  console.log("Filters applied:", filters);

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

  if (!updatedUser) throw new Error("User not found");
  return updatedUser;
};

// Admin: Create specialist profile
const createSpecialistProfile = async (specialistData, requesterRole) => {
  const exists = await User.findOne({ email: specialistData.email });
  if (exists) throw new Error("Email already exists");

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
  if (!specialist) throw new Error("Specialist not found");
  if (specialist.role !== "specialist")
    throw new Error("User is not a specialist");

  specialist.specialistInfo.status = "active";
  await specialist.save();

  return {
    message: "Specialist activated successfully",
    specialist,
  };
};

// Admin: Deactivate specialist
const deactivateSpecialist = async (specialistId, requesterRole) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) throw new Error("Specialist not found");
  if (specialist.role !== "specialist")
    throw new Error("User is not a specialist");

  specialist.specialistInfo.status = "inactive";
  await specialist.save();

  return {
    message: "Specialist deactivated successfully",
    specialist,
  };
};

const deleteProfile = async (userId, requesterRole) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  await user.deleteOne();
  return { message: "Profile deleted successfully" };
};

export default {
  getProfile,
  searchProfiles,
  updateProfile,
  createSpecialistProfile,
  deleteProfile,
  activateSpecialist,
  deactivateSpecialist,
};
