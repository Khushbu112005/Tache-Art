import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import getRazorpay from "@/lib/razorpay";
import Payment from "@/models/Payment";
import { NotFoundError, ValidationError } from "@/utils/apiResponse";
import { DEFAULT_CURRENCY } from "@/utils/constants";

export class PaymentService {
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
      .populate("artworkId", "title price")
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
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get revenue stats
   */
  static async getRevenueStats() {
    await dbConnect();

    const [totalRevenue, monthlyRevenue] = await Promise.all([
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
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
    };
  }
}
