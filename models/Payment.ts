import mongoose, { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true }, // Razorpay order ID
    paymentId: { type: String, default: null }, // Razorpay payment ID
    signature: { type: String, default: null }, // Razorpay signature
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    artworkId: { type: Schema.Types.ObjectId, ref: "Artwork", default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;
