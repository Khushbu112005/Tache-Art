import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import getRazorpay from "@/lib/razorpay";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import Artwork from "@/models/Artwork";
import { NotFoundError, ValidationError } from "@/utils/apiResponse";
import { DEFAULT_CURRENCY } from "@/utils/constants";
import { IManualUpiPaymentInput } from "@/types/payment";

export class PaymentService {
  /**
   * Submit a manual UPI payment with screenshot and UTR
   */
  static async submitManualUpiPayment(
    input: IManualUpiPaymentInput & { userId?: string }
  ) {
    await dbConnect();

    const uniqueOrderId = `UPI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Order with "payment_pending_verification" status
    const order = new Order({
      userId: input.userId || null,
      name: input.name,
      email: input.email,
      phone: input.phone,
      shippingAddress: input.shippingAddress || "",
      artworkType: input.artworkTitle ? `Original: ${input.artworkTitle}` : "Artwork Purchase",
      size: "Original Piece",
      message: input.notes || `UPI Payment for ${input.artworkTitle || "artwork"}. UTR: ${input.utrNumber}`,
      referenceImage: input.screenshotUrl,
      status: "payment_pending_verification",
      priority: "medium",
      totalAmount: input.amount,
      paymentStatus: "pending_verification",
      paymentMethod: "manual_upi",
      utrNumber: input.utrNumber.trim(),
      paymentScreenshot: input.screenshotUrl,
      senderUpi: input.senderUpi ? input.senderUpi.trim() : null,
      artworkId: input.artworkId || null,
    });

    await order.save();

    // Create Payment record
    const payment = new Payment({
      userId: input.userId || null,
      orderId: uniqueOrderId,
      paymentId: input.utrNumber.trim(),
      amount: input.amount,
      currency: DEFAULT_CURRENCY,
      status: "pending_verification",
      paymentMethod: "manual_upi",
      utrNumber: input.utrNumber.trim(),
      screenshotUrl: input.screenshotUrl,
      senderUpi: input.senderUpi ? input.senderUpi.trim() : null,
      customerName: input.name,
      customerEmail: input.email,
      customerPhone: input.phone,
      artworkId: input.artworkId || null,
      orderRef: order._id,
      notes: input.notes || "",
    });

    await payment.save();

    // Link payment ID in order
    order.paymentId = payment._id;
    await order.save();

    return {
      order,
      payment,
    };
  }

  /**
   * Verify manual UPI payment (Admin: approve or reject)
   */
  static async verifyManualPayment(
    paymentId: string,
    action: "approve" | "reject",
    adminEmail = "admin",
    reason?: string
  ) {
    await dbConnect();

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError("Payment");
    }

    const now = new Date();

    if (action === "approve") {
      payment.status = "paid";
      payment.verifiedAt = now;
      payment.verifiedBy = adminEmail;
      payment.rejectionReason = null;
      await payment.save();

      // Update linked order if present
      if (payment.orderRef) {
        await Order.findByIdAndUpdate(payment.orderRef, {
          status: "in-progress",
          paymentStatus: "paid",
          verifiedAt: now,
          verifiedBy: adminEmail,
        });
      }

      // Mark artwork as sold
      if (payment.artworkId) {
        await Artwork.findByIdAndUpdate(payment.artworkId, { isSold: true });
      }
    } else {
      payment.status = "rejected";
      payment.rejectionReason = reason || "Payment not verified or not received in bank account";
      payment.verifiedAt = now;
      payment.verifiedBy = adminEmail;
      await payment.save();

      // Update linked order if present
      if (payment.orderRef) {
        await Order.findByIdAndUpdate(payment.orderRef, {
          status: "cancelled",
          paymentStatus: "rejected",
          rejectionReason: reason || "Payment verification rejected",
          verifiedAt: now,
          verifiedBy: adminEmail,
        });
      }
    }

    return payment;
  }

  /**
   * Create a Razorpay order and store it in the database
   */
  static async createOrder(
    userId: string,
    amount: number,
    artworkId?: string,
    notes?: Record<string, string>
  ) {
    await dbConnect();

    // Amount in paise (Razorpay expects smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      throw new ValidationError("Amount must be at least ₹1");
    }

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: DEFAULT_CURRENCY,
      notes: notes || {},
    });

    // Store in database
    const payment = new Payment({
      userId,
      orderId: razorpayOrder.id,
      amount,
      currency: DEFAULT_CURRENCY,
      status: "created",
      paymentMethod: "razorpay",
      artworkId: artworkId || null,
      metadata: { razorpayOrder },
    });

    await payment.save();

    return {
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: DEFAULT_CURRENCY,
      paymentDbId: payment._id.toString(),
    };
  }

  /**
   * Verify Razorpay payment signature and update database
   */
  static async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    await dbConnect();

    // Verify signature using HMAC SHA256
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("RAZORPAY_KEY_SECRET not configured");
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpaySignature;

    // Update payment record
    const payment = await Payment.findOne({ orderId: razorpayOrderId });
    if (!payment) {
      throw new NotFoundError("Payment");
    }

    if (isValid) {
      payment.paymentId = razorpayPaymentId;
      payment.signature = razorpaySignature;
      payment.status = "paid";
    } else {
      payment.status = "failed";
    }

    await payment.save();

    return {
      verified: isValid,
      payment: payment.toObject(),
    };
  }

  /**
   * Get all payments (admin)
   */
  static async getAll() {
    await dbConnect();
    return Payment.find({})
      .populate("userId", "name email")
      .populate("artworkId", "title price imageUrl")
      .populate("orderRef", "artworkType status")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get payments by user
   */
  static async getByUserId(userId: string) {
    await dbConnect();
    return Payment.find({ userId })
      .populate("artworkId", "title price imageUrl")
      .populate("orderRef", "artworkType status")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get pending verification count
   */
  static async getPendingCount() {
    await dbConnect();
    return Payment.countDocuments({ status: "pending_verification" });
  }

  /**
   * Get revenue stats
   */
  static async getRevenueStats() {
    await dbConnect();

    const [totalRevenue, monthlyRevenue, pendingCount] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
      Payment.countDocuments({ status: "pending_verification" }),
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
      pendingCount,
    };
  }
}
