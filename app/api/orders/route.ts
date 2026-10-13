import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { EmailService } from "@/services/email.service";
import Message from "@/models/Message";
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

    // Save to Message collection so it appears in Admin Messages
    const { name, email, artworkType, size, message, referenceImage } = data;
    try {
      await Message.create({
        name,
        email,
        message: message || `Custom order inquiry for ${artworkType}`,
        source: "custom_request",
        artworkType: artworkType || "Custom Request",
        size: size || "Standard (24x36)",
        referenceImage: referenceImage as string | undefined,
        orderId: order._id,
      });
      console.log(`[Order] Custom request saved to Message collection for: ${name}`);
    } catch (msgErr) {
      console.error("[Order] Failed to save custom request to Message collection:", msgErr);
    }

    // --- Added Integrations for Email and FormSubmit ---
    const orderId = order._id.toString();

    // 1. Dispatch notification to studio admin (aasthajainokok@gmail.com) via Gmail SMTP
    try {
      if (EmailService.isConfigured()) {
        await EmailService.sendAdminOrderNotification(
          name,
          email,
          orderId,
          artworkType,
          size,
          message,
          referenceImage as string | undefined,
          data.phone as string | undefined,
          data.shippingAddress as string | undefined
        );
        console.log(`[Order] SMTP notification sent successfully to admin for order: ${orderId}`);
      } else {
        console.warn(`[Order] EmailService not configured. Skipping admin notification.`);
      }
    } catch (adminEmailError) {
      console.error("[Order] Failed to send admin notification email:", adminEmailError);
    }

    // 2. Dispatch customer confirmation email (best effort)
    try {
      if (EmailService.isConfigured() && email) {
        await EmailService.sendOrderConfirmation(email, name, orderId, artworkType);
        console.log(`[Order] Confirmation email sent successfully to customer: ${email}`);
      }
    } catch (customerEmailError) {
      console.error("[Order] Failed to send customer confirmation email:", customerEmailError);
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
