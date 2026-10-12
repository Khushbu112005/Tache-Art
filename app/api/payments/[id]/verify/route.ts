import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized. Admin access required.", 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return errorResponse("Invalid action. Must be 'approve' or 'reject'.", 400);
    }

    const updatedPayment = await PaymentService.verifyManualPayment(
      id,
      action,
      session.user.email || "admin",
      reason
    );

    return successResponse(updatedPayment);
  } catch (error) {
    return handleApiError(error);
  }
}
