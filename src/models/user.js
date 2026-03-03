import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Security: Hide by default - explicitly select if needed
    },
    role: {
      type: String,
      enum: ["customer", "specialist", "admin"],
      default: "customer",
    },
    refreshToken: {
      type: String,
      select: false, // Security: Hide by default - explicitly select if needed
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    // this points to the assessment result document
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      unique: true,
      sparse: true,
    },
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (value) {
          // If no specialist assigned, skip
          if (!value) return true;

          if (this.role !== "customer") return false;

          // Look up the user being assigned
          const user = await mongoose.models.User.findById(value);
          // Ensure the user exists and has role "specialist"
          return user && user.role === "specialist";
        },
        message:
          "Assigned specialist must be a user with role 'specialist' and must be assigned to a customer",
      },
    },

    // specialist fields
    specialistInfo: {
      type: new mongoose.Schema(
        {
          specialization: { type: String },
          experienceYears: { type: Number },
          status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive",
          },
        },
        { _id: false }, // optional: prevents creating a new _id for subdoc
      ),
      required: function () {
        return this.role === "specialist";
      },
      validate: {
        validator: function (value) {
          if (this.role !== "specialist") return true;
        },
        message: "specialistInfo is required for users with role 'specialist'",
      },
    },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function () {
  // Only hash if password changed
  if (this.isModified("passwordHash")) {
    this.passwordHash = bcrypt.hashSync(this.passwordHash, 12);
  }
  // no next() here!
});

// Instance method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  // Remove sensitive fields
  delete user.passwordHash;
  delete user.refreshToken; // if you store it
  delete user.__v;

  // Rename fields
  user.id = user._id;
  delete user._id;

  // Format lastSeen
  if (user.lastSeen) {
    user.lastSeen = user.lastSeen.toISOString();
  }

  // Remove specialist and assessment if not customer
  if (user.role !== "customer") {
    delete user.specialist;
    delete user.assessment;
  }

  // Remove specialistInfo if not a specialist
  if (user.role !== "specialist") {
    delete user.specialistInfo;
  }

  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
