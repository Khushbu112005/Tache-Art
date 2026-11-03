import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentService } from "@/services/payment.service";
import { EmailService } from "@/services/email.service";
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

    const orderId = result.order._id.toString();

    // 1. Dispatch email to studio admin alerting them of a new order with UPI payment
    try {
      if (EmailService.isConfigured()) {
        await EmailService.sendAdminNewArtworkOrderNotification({
          orderId,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          shippingAddress: data.shippingAddress,
          artworkTitle: data.artworkTitle || "Original Artwork Piece",
          amount: data.amount,
          utrNumber: data.utrNumber,
          screenshotUrl: data.screenshotUrl,
          senderUpi: data.senderUpi,
          notes: data.notes,
        });
        console.log(`[ManualUPI] Admin order notification email sent for order: ${orderId}`);
      } else {
        console.warn("[ManualUPI] EmailService is not configured. Missing credentials.");
      }
    } catch (adminEmailError) {
      console.error("[ManualUPI] Failed to send admin order notification email:", adminEmailError);
    }

    // 2. Dispatch order confirmation email to the customer
    try {
      if (EmailService.isConfigured() && data.email) {
        await EmailService.sendOrderConfirmation(
          data.email,
          data.name,
          orderId,
          data.artworkTitle || "Original Artwork Piece"
        );
        console.log(`[ManualUPI] Customer order confirmation sent to: ${data.email}`);
      }
    } catch (customerEmailError) {
      console.error("[ManualUPI] Failed to send customer order confirmation email:", customerEmailError);
    }

    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
