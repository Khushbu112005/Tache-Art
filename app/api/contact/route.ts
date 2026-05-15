import { NextRequest } from "next/server";
import { handleApiError, messageResponse, errorResponse, successResponse } from "@/utils/apiResponse";
import { validateContactInput } from "@/utils/validation";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import { EmailService } from "@/services/email.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    await dbConnect();
    const messages = await Message.find({}).sort({ createdAt: -1 }).lean();
    return successResponse(messages);
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

    // Also attempt to send email via Nodemailer
    try {
      if (EmailService.isConfigured()) {
        await EmailService.sendContactEmail(name, email, message);
        console.log(`[Contact] Nodemailer notification sent successfully for ${name}`);
      } else {
        console.log(`[Contact] Nodemailer not configured. Skipping.`);
      }
    } catch (emailError) {
      console.error("[Contact] Failed to send Nodemailer email:", emailError);
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



