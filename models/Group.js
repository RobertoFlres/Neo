import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1", // Default indigo color
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual for subscriber count
groupSchema.virtual("subscriberCount", {
  ref: "Lead",
  localField: "_id",
  foreignField: "groups",
  count: true,
});

// add plugin that converts mongoose to json
groupSchema.plugin(toJSON);

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
