import mongoose, { Schema, model, models } from "mongoose";

const ArtworkSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    priority: {
      type: String,
      enum: ["featured", "normal", "archived"],
      default: "normal",
    },
    medium: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    isSold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for search and filtering
ArtworkSchema.index({ title: "text", description: "text" });
ArtworkSchema.index({ category: 1, priority: 1 });
ArtworkSchema.index({ price: 1 });
ArtworkSchema.index({ tags: 1 });
ArtworkSchema.index({ createdAt: -1 });

const Artwork = models.Artwork || model("Artwork", ArtworkSchema);
export default Artwork;
