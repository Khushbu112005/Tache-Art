import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArtworkService } from "@/services/artwork.service";
import { OrderService } from "@/services/order.service";
import { UserService } from "@/services/user.service";
import { PaymentService } from "@/services/payment.service";
import { successResponse, errorResponse, handleApiError } from "@/utils/apiResponse";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const [artworkStats, orderStats, userStats, revenueStats, recentOrders, monthlyStats] =
      await Promise.all([
        ArtworkService.getStats(),
        OrderService.getStats(),
        UserService.getStats(),
        PaymentService.getRevenueStats(),
        OrderService.getRecent(5),
        OrderService.getMonthlyStats(6),
      ]);

    return successResponse({
      artworks: artworkStats,
      orders: orderStats,
      users: userStats,
      revenue: revenueStats,
      recentOrders,
      monthlyStats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
