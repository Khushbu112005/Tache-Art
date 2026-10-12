import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { isValidObjectId } from "@/utils/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid order ID", 400);
    }

    const data = await req.json();

    // Check if customer is requesting cancellation of their own order
    if (session.user.role !== "admin") {
      await dbConnect();
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        return errorResponse("Order not found", 404);
      }

      const isOwner =
        (existingOrder.userId && existingOrder.userId.toString() === session.user.id) ||
        existingOrder.email === session.user.email;

      if (!isOwner) {
        return errorResponse("Forbidden. You can only manage your own orders.", 403);
      }

      // Customer can only cancel pending or pending_verification orders
      if (data.action === "cancel" || data.status === "cancelled") {
        if (
          existingOrder.status !== "pending" &&
          existingOrder.status !== "payment_pending_verification"
        ) {
          return errorResponse(
            "This order is already in progress or completed and cannot be cancelled automatically. Please contact our support.",
            400
          );
        }

        const cancelledOrder = await OrderService.cancelOrder(
          id,
          session.user.name || "Customer",
          data.reason || "Cancelled by customer"
        );
        return successResponse(cancelledOrder);
      }

      return errorResponse("Only cancellations are permitted for customers.", 403);
    }

    // Admin handling
    if (data.action === "cancel") {
      const cancelledOrder = await OrderService.cancelOrder(
        id,
        "Admin",
        data.reason || "Cancelled by admin"
      );
      return successResponse(cancelledOrder);
    }

    const order = await OrderService.updateStatus(id, data);
    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid order ID", 400);
    }

    await dbConnect();
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return errorResponse("Order not found", 404);
    }

    const isOwner =
      (existingOrder.userId && existingOrder.userId.toString() === session.user.id) ||
      existingOrder.email === session.user.email ||
      session.user.role === "admin";

    if (!isOwner) {
      return errorResponse("Forbidden", 403);
    }

    const cancelledOrder = await OrderService.cancelOrder(
      id,
      session.user.name || "Customer",
      "Cancelled by user"
    );

    return successResponse(cancelledOrder);
  } catch (error) {
    return handleApiError(error);
  }
}
