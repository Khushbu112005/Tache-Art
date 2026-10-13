import { NextRequest } from "next/server";
import { handleApiError, messageResponse, errorResponse, successResponse } from "@/utils/apiResponse";
import { validateContactInput } from "@/utils/validation";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import { EmailService } from "@/services/email.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    await dbConnect();

    // Auto-sync any existing custom order inquiries into Message collection so past requests appear
    try {
      const Order = (await import("@/models/Order")).default;
      const unSyncedOrders = await Order.find({
        message: { $exists: true, $ne: "" },
      }).lean();

      for (const ord of unSyncedOrders) {
        const alreadyExists = await Message.findOne({
          $or: [
            { orderId: ord._id },
            { email: ord.email, message: ord.message },
          ],
        });
        if (!alreadyExists) {
          await Message.create({
            name: ord.name,
            email: ord.email,
            message: ord.message,
            source: "custom_request",
            artworkType: ord.artworkType || "Custom Request",
            size: ord.size || "Standard",
            referenceImage: ord.referenceImage || undefined,
            orderId: ord._id,
            createdAt: ord.createdAt,
          });
        }
      }
    } catch (syncErr) {
      console.error("[Contact GET] Sync existing orders note:", syncErr);
    }

    const messages = await Message.find({}).sort({ createdAt: -1 }).lean();
    return successResponse(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const { id, isRead } = await req.json();
    if (!id) return errorResponse("Message ID required", 400);

    await dbConnect();
    const updated = await Message.findByIdAndUpdate(
      id,
      { isRead: !!isRead },
      { new: true }
    );
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Message ID required", 400);

    await dbConnect();
    await Message.findByIdAndDelete(id);
    return messageResponse("Message deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validation = validateContactInput(data);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400);
    }

    const { name, email, message } = data;

    // Connect to database and save the message
    await dbConnect();
    
    const newMessage = new Message({
      name,
      email,
      message
    });
    
    await newMessage.save();
    console.log(`[Contact] New message saved to database from: ${name} (${email})`);

    // 1. Dispatch email to studio admin (aasthajainokok@gmail.com) via Gmail SMTP
    try {
      if (EmailService.isConfigured()) {
        await EmailService.sendContactEmail(name, email, message);
        console.log(`[Contact] SMTP notification sent successfully to admin for message from: ${name}`);
      } else {
        console.warn(`[Contact] EmailService is not configured. Missing EMAIL_SERVER_USER/EMAIL_SERVER_PASSWORD.`);
      }
    } catch (emailError) {
      console.error("[Contact] Failed to send Nodemailer email to admin:", emailError);
    }

    // 2. Dispatch customer acknowledgement email
    try {
      if (EmailService.isConfigured() && email) {
        await EmailService.sendContactConfirmation(email, name);
        console.log(`[Contact] Customer confirmation sent to: ${email}`);
      }
    } catch (custAckErr) {
      console.error("[Contact] Failed to send customer acknowledgement email:", custAckErr);
    }

    // Also attempt to send email via FormSubmit (as requested by user as a fallback)
    try {
      const fsResponse = await fetch("https://formsubmit.co/ajax/aasthajainokok@gmail.com", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Origin": "https://tache-art.vercel.app",
              "Referer": "https://tache-art.vercel.app/contact"
          },
          body: JSON.stringify({
              name,
              email,
              message,
              _subject: `New Contact Form Message from ${name}`,
              _template: "table"
          }),
      });
      if (fsResponse.ok) {
         console.log(`[Contact] FormSubmit notification triggered successfully for ${name}`);
      } else {
         console.error(`[Contact] FormSubmit API returned status: ${fsResponse.status}`);
      }
    } catch (fsError) {
      console.error("[Contact] FormSubmit API failed (server might be down):", fsError);
    }

    // Always return success if MongoDB save succeeded, regardless of email failures
    return messageResponse("Message received successfully! We will get back to you soon.");
  } catch (error) {
    console.error("Contact API error:", error);
    return handleApiError(error);
  }
}



