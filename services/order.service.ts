import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Artwork from "@/models/Artwork";
import { NotFoundError } from "@/utils/apiResponse";
import { EmailService } from "@/services/email.service";

export class OrderService {
  static async getAll(excludeCustom = true) {
    await dbConnect();
    const filter = excludeCustom
      ? { artworkType: { $nin: ["Custom Request", "Other"] } }
      : {};
    return Order.find(filter)
      .populate("artworkId", "title price imageUrl")
      .populate("paymentId", "utrNumber screenshotUrl status paymentMethod")
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getByUserId(userId: string) {
    await dbConnect();
    return Order.find({ userId })
      .populate("artworkId", "title price imageUrl")
      .populate("paymentId", "utrNumber screenshotUrl status paymentMethod")
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getById(id: string) {
    await dbConnect();
    const order = await Order.findById(id)
      .populate("artworkId", "title price imageUrl")
      .populate("paymentId", "utrNumber screenshotUrl status paymentMethod")
      .lean();
    if (!order) throw new NotFoundError("Order");
    return order;
  }

  static async create(data: Record<string, unknown>) {
    await dbConnect();
    const order = new Order(data);
    await order.save();
    return order;
  }

  static async updateStatus(id: string, data: Record<string, unknown>) {
    await dbConnect();
    const order = await Order.findByIdAndUpdate(id, data, { new: true });
    if (!order) throw new NotFoundError("Order");

    // Send email notification if status was updated
    if (data.status && typeof data.status === "string" && EmailService.isConfigured()) {
      try {
        await EmailService.sendStatusUpdateEmail(
          order.email,
          order.name,
          order._id.toString(),
          order.artworkType,
          data.status
        );
      } catch (error) {
        console.error("Failed to send status update email:", error);
      }
    }

    return order;
  }

  /**
   * Cancel an order (by customer or admin)
   */
  static async cancelOrder(id: string, cancelledBy = "customer", reason?: string) {
    await dbConnect();
    const order = await Order.findById(id);
    if (!order) throw new NotFoundError("Order");

    order.status = "cancelled";
    if (order.paymentStatus === "pending_verification" || order.paymentStatus === "unpaid") {
      order.paymentStatus = "rejected";
    }
    order.rejectionReason = reason || `Cancelled by ${cancelledBy}`;
    await order.save();

    if (order.paymentId) {
      await Payment.findByIdAndUpdate(order.paymentId, {
        status: "rejected",
        rejectionReason: reason || `Cancelled by ${cancelledBy}`,
      });
    }

    if (order.artworkId) {
      await Artwork.findByIdAndUpdate(order.artworkId, { isSold: false });
    }

    if (EmailService.isConfigured()) {
      try {
        await EmailService.sendStatusUpdateEmail(
          order.email,
          order.name,
          order._id.toString(),
          order.artworkType,
          "cancelled"
        );
      } catch (err) {
        console.error("Failed to send cancellation email:", err);
      }
    }

    return order;
  }

  /**
   * Permanently delete an order and associated payments / custom messages
   */
  static async deleteOrder(id: string) {
    await dbConnect();
    const order = await Order.findById(id);
    if (!order) throw new NotFoundError("Order");

    if (order.paymentId) {
      await Payment.findByIdAndDelete(order.paymentId);
    }

    if (order.artworkId) {
      await Artwork.findByIdAndUpdate(order.artworkId, { isSold: false });
    }

    try {
      const Message = (await import("@/models/Message")).default;
      await Message.deleteMany({ orderId: id });
    } catch (msgErr) {
      console.error("Failed to delete linked message:", msgErr);
    }

    await Order.findByIdAndDelete(id);
    return { success: true, id };
  }


  static async getStats() {
    await dbConnect();
    const baseFilter = { artworkType: { $nin: ["Custom Request", "Other"] } };
    const [total, pending, paymentPendingVerification, inProgress, completed, cancelled] =
      await Promise.all([
        Order.countDocuments(baseFilter),
        Order.countDocuments({ ...baseFilter, status: "pending" }),
        Order.countDocuments({ ...baseFilter, status: "payment_pending_verification" }),
        Order.countDocuments({ ...baseFilter, status: "in-progress" }),
        Order.countDocuments({ ...baseFilter, status: "completed" }),
        Order.countDocuments({ ...baseFilter, status: "cancelled" }),
      ]);
    return { total, pending, paymentPendingVerification, inProgress, completed, cancelled };
  }


  static async getRecent(limit = 5) {
    await dbConnect();
    return Order.find({ artworkType: { $nin: ["Custom Request", "Other"] } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getMonthlyStats(months = 6) {
    await dbConnect();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return stats;
  }
}
