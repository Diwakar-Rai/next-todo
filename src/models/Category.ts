import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
  },
  { timestamps: true },
);

CategorySchema.index({ ownerId: 1, name: 1 }, { unique: true });
export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
