import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
