import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// NEWSLETTER SCHEMA is used to store the newsletters
const newsletterSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    content: {
      summary: {
        type: String,
        default: "",
      },
      articles: [
        {
          title: String,
          summary: String,
          link: String,
          source: String,
          image: String, // URL to image in Cloudinary
          titleColor: { type: String, default: "#2b3e81" }, // Title color from branding
        },
      ],
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
newsletterSchema.plugin(toJSON);

export default mongoose.models.Newsletter ||
  mongoose.model("Newsletter", newsletterSchema);

