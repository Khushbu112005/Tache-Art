import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { validateOrderInput } from "@/utils/validation";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userOnly = searchParams.get("user") === "true";

    // User's own orders
    if (userOnly && session?.user?.id) {
      const orders = await OrderService.getByUserId(session.user.id);
      return successResponse(orders);
    }

    // Admin: all orders
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const orders = await OrderService.getAll();
    return successResponse(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validation = validateOrderInput(data);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400);
    }

    // Attach user ID if logged in (skip for 'admin' string)
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.id !== "admin") {
      data.userId = session.user.id;
    }

    const order = await OrderService.create(data);
    return successResponse(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
