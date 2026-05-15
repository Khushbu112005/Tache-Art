import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { NotFoundError } from "@/utils/apiResponse";

export class OrderService {
  static async getAll() {
    await dbConnect();
    return Order.find({}).sort({ createdAt: -1 }).lean();
  }

  static async getByUserId(userId: string) {
    await dbConnect();
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  static async getById(id: string) {
    await dbConnect();
    const order = await Order.findById(id).lean();
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
    return order;
  }

  static async getStats() {
    await dbConnect();
    const [total, pending, inProgress, completed, cancelled] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ status: "in-progress" }),
        Order.countDocuments({ status: "completed" }),
        Order.countDocuments({ status: "cancelled" }),
      ]);
    return { total, pending, inProgress, completed, cancelled };
  }

  static async getRecent(limit = 5) {
    await dbConnect();
    return Order.find().sort({ createdAt: -1 }).limit(limit).lean();
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
