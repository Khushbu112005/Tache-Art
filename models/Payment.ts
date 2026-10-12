import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null },
    orderId: { type: String, required: true, unique: true }, // UPI Order Ref or Razorpay order ID
    paymentId: { type: String, default: null }, // UTR or Razorpay payment ID
    signature: { type: String, default: null }, // Razorpay signature (if gateway used)
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "pending_verification", "paid", "failed", "refunded", "rejected"],
      default: "pending_verification",
    },
    paymentMethod: { type: String, default: "manual_upi" },
    utrNumber: { type: String, default: null },
    screenshotUrl: { type: String, default: null },
    senderUpi: { type: String, default: null },
    customerName: { type: String, default: null },
    customerEmail: { type: String, default: null },
    customerPhone: { type: String, default: null },
    artworkId: { type: Schema.Types.ObjectId, ref: "Artwork", default: null },
    orderRef: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    notes: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ utrNumber: 1 });
PaymentSchema.index({ createdAt: -1 });

// Force re-register Payment model if already cached with old schema in Next.js development
if (models.Payment) {
  delete (models as Record<string, unknown>).Payment;
}

const Payment = model("Payment", PaymentSchema);
export default Payment;

