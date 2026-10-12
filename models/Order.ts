import { Schema, model, models } from "mongoose";

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
      enum: ["pending", "payment_pending_verification", "in-progress", "completed", "cancelled"],
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
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending_verification", "paid", "rejected"],
      default: "unpaid",
    },
    paymentMethod: { type: String, default: "manual_upi" },
    utrNumber: { type: String, default: null },
    paymentScreenshot: { type: String, default: null },
    senderUpi: { type: String, default: null },
    phone: { type: String, default: null },
    shippingAddress: { type: String, default: null },
    artworkId: {
      type: Schema.Types.ObjectId,
      ref: "Artwork",
      default: null,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    rejectionReason: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, priority: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// Force re-register Order model if already cached with old schema in Next.js development
if (models.Order) {
  delete (models as Record<string, unknown>).Order;
}

const Order = model("Order", OrderSchema);
export default Order;

