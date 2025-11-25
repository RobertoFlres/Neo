import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const landingArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    url: { type: String, required: true, trim: true },
    source: { type: String, trim: true },
    image: { type: String, trim: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const landingNewsSchema = new mongoose.Schema(
  {
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    articles: {
      type: [landingArticleSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

landingNewsSchema.plugin(toJSON);

export default mongoose.models.LandingNews ||
  mongoose.model("LandingNews", landingNewsSchema);
