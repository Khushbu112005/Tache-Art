import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import { successResponse, errorResponse, handleApiError } from "@/utils/apiResponse";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const payments = await PaymentService.getAll();
    return successResponse(payments);
  } catch (error) {
    return handleApiError(error);
  }
}
