import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { validateManualUpiPayment } from "@/utils/validation";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validation = validateManualUpiPayment(data);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id && session.user.id !== "admin" ? session.user.id : undefined;

    const result = await PaymentService.submitManualUpiPayment({
      ...data,
      userId,
    });

    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
