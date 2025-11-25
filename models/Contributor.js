import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// CONTRIBUTOR SCHEMA - Used to store contributors who can access the contributor dashboard
const contributorSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true, // Prevent duplicates
    },
    name: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: String, // Email of the admin who added this contributor
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
contributorSchema.plugin(toJSON);

export default mongoose.models.Contributor || mongoose.model("Contributor", contributorSchema);

