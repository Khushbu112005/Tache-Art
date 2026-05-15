import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
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
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid order ID", 400);
    }

    const data = await req.json();
    const order = await OrderService.updateStatus(id, data);
    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}
