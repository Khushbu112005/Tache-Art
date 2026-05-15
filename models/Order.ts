import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    artworkType: { type: String, required: true },
    size: { type: String, required: true },
    message: { type: String, required: true },
    referenceImage: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    deadline: { type: Date, default: null },
    tags: { type: [String], default: [] },
    totalAmount: { type: Number, default: 0 },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, priority: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = models.Order || model("Order", OrderSchema);
export default Order;
