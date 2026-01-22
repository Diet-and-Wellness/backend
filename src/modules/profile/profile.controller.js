import profileService from "./profile.service.js";

// Get current user's profile
const getProfile = async (req, res, next) => {
  try {
    const result = await profileService.getProfile(req.user.user_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get another user's profile details (admin/specialists only)
const getProfileDetails = async (req, res, next) => {
  try {
    const result = await profileService.getProfile(req.params.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Search and filter profiles
const searchProfiles = async (req, res, next) => {
  try {
    const result = await profileService.searchProfiles(
      req.query,
      req.user.role,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const result = await profileService.updateProfile(
      req.user.user_id,
      req.body,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Create specialist profile
const createSpecialistProfile = async (req, res, next) => {
  try {
    const result = await profileService.createSpecialistProfile(
      req.body,
      req.user.role,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Activate specialist
const activateSpecialist = async (req, res, next) => {
  try {
    const result = await profileService.activateSpecialist(
      req.params.specialistId,
      req.user.role,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Deactivate specialist
const deactivateSpecialist = async (req, res, next) => {
  try {
    const result = await profileService.deactivateSpecialist(
      req.params.specialistId,
      req.user.role,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete profile
const deleteProfile = async (req, res, next) => {
  try {
    const result = await profileService.deleteProfile(
      req.params.userId,
      req.user.role,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  getProfileDetails,
  searchProfiles,
  updateProfile,
  createSpecialistProfile,
  activateSpecialist,
  deactivateSpecialist,
  deleteProfile,
};
