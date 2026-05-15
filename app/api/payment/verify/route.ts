import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import { successResponse, errorResponse, handleApiError } from "@/utils/apiResponse";
import { validatePaymentVerification } from "@/utils/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const data = await req.json();

    const validation = validatePaymentVerification(data);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400);
    }

    const result = await PaymentService.verifyPayment(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature
    );

    if (!result.verified) {
      return errorResponse("Payment verification failed", 400);
    }

    return successResponse({
      verified: true,
      paymentId: result.payment._id,
      status: result.payment.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
