import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const articleSuggestionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String, // Texto plano para búsqueda/preview
      trim: true,
    },
    summary: {
      type: String, // HTML del RichTextEditor
      trim: true,
    },
    image: {
      type: String, // URL de Cloudinary
    },
    titleColor: {
      type: String,
      default: "#2b3e81",
    },
    source: {
      type: String,
      default: "Contribuidor",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedBy: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      userId: {
        type: String,
      },
    },
    reviewedBy: {
      email: String,
      name: String,
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String, // Admin notes
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

articleSuggestionSchema.plugin(toJSON);

export default mongoose.models.ArticleSuggestion || 
  mongoose.model("ArticleSuggestion", articleSuggestionSchema);
