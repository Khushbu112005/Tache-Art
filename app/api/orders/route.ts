import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { EmailService } from "@/services/email.service";
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

    // --- Added Integrations for Email and FormSubmit ---
    const { name, email, artworkType, size, message, referenceImage } = data;
    const orderId = order._id.toString();

    // 1. SMTP Email notifications (Gmail via Nodemailer)
    try {
      if (EmailService.isConfigured()) {
        // Send confirmation to the customer
        await EmailService.sendOrderConfirmation(email, name, orderId, artworkType);
        // Send notification to the admin
        await EmailService.sendAdminOrderNotification(
          name,
          email,
          orderId,
          artworkType,
          size,
          message,
          referenceImage as string | undefined
        );
        console.log(`[Order] Nodemailer notifications sent successfully for order: ${orderId}`);
      } else {
        console.log(`[Order] Nodemailer not configured. Skipping.`);
      }
    } catch (emailError) {
      console.error("[Order] Failed to send Nodemailer emails:", emailError);
    }

    // 2. FormSubmit.co integration fallback
    try {
      const fsResponse = await fetch("https://formsubmit.co/ajax/aasthajainokok@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Origin": "https://tache-art.vercel.app",
          "Referer": "https://tache-art.vercel.app/order",
        },
        body: JSON.stringify({
          name,
          email,
          artworkType,
          size,
          message,
          referenceImage: referenceImage || "None",
          _subject: `New Custom Order Request #${orderId.slice(-6).toUpperCase()} from ${name}`,
          _template: "table",
        }),
      });
      if (fsResponse.ok) {
        console.log(`[Order] FormSubmit notification triggered successfully for order: ${orderId}`);
      } else {
        console.error(`[Order] FormSubmit API returned status: ${fsResponse.status}`);
      }
    } catch (fsError) {
      console.error("[Order] FormSubmit API failed (server might be down):", fsError);
    }
    // ----------------------------------------------------

    return successResponse(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
