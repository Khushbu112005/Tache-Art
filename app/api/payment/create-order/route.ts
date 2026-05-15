import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import { successResponse, errorResponse, handleApiError } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { amount, artworkId, notes } = await req.json();

    if (!amount || amount <= 0) {
      return errorResponse("Valid amount is required", 400);
    }

    const order = await PaymentService.createOrder(
      session.user.id,
      amount,
      artworkId,
      notes
    );

    return successResponse(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
