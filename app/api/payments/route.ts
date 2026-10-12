import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import { successResponse, errorResponse, handleApiError } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const userOnly = searchParams.get("user") === "true";

    if (userOnly || session.user.role !== "admin") {
      const payments = await PaymentService.getByUserId(session.user.id);
      return successResponse(payments);
    }

    const payments = await PaymentService.getAll();
    return successResponse(payments);
  } catch (error) {
    return handleApiError(error);
  }
}
