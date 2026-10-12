import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EmailService } from "@/services/email.service";
import Message from "@/models/Message";
import dbConnect from "@/lib/mongodb";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized. Admin access required.", 401);
    }

    const body = await req.json();
    const { to, subject, message, messageId } = body;

    if (!to || !subject || !message) {
      return errorResponse("Recipient email, subject, and message are required.", 400);
    }

    await dbConnect();

    // Check if EmailService has credentials configured
    const configured = EmailService.isConfigured();

    if (!configured) {
      return errorResponse(
        "Gmail SMTP is not fully configured in environment variables (EMAIL_SERVER_PASSWORD). Please configure your Gmail App Password or use the 'Open in Mail App' option.",
        400
      );
    }

    try {
      await EmailService.send({
        to,
        subject,
        text: message,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1a1a1a; line-height: 1.6; border: 1px solid #eae5de; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #fdfbf7; padding: 28px 24px; text-align: center; border-bottom: 2px solid #8B1D1D;">
              <h1 style="color: #8B1D1D; letter-spacing: 5px; margin: 0; font-size: 24px; font-weight: 700;">TACHÈ</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2.5px; color: #888; text-transform: uppercase;">Art Studio</p>
            </div>
            <div style="padding: 32px 28px;">
              <div style="white-space: pre-wrap; font-size: 14px; color: #2d2d2d; line-height: 1.8;">${message.replace(/\n/g, "<br/>")}</div>
            </div>
            <div style="background-color: #faf8f5; padding: 22px 24px; border-top: 1px solid #eae5de; text-align: center; font-size: 12px; color: #777;">
              <p style="margin: 0; font-weight: 600; color: #8B1D1D; letter-spacing: 1.5px; text-transform: uppercase;">TACHÈ Art Studio</p>
              <p style="margin: 6px 0 0 0;">Inquiry Response &bull; Crafted with care</p>
              <p style="margin: 6px 0 0 0; color: #999; font-size: 11px;">You can reply directly to this email to continue the conversation.</p>
            </div>
          </div>
        `,
      });
    } catch (smtpErr: unknown) {
      console.error("[Email Reply Error]:", smtpErr);
      const errMsg = smtpErr instanceof Error ? smtpErr.message : "SMTP sending failed";
      return errorResponse(`Failed to send email via SMTP: ${errMsg}`, 500);
    }

    // Mark message as replied and read in database if messageId provided
    if (messageId) {
      await Message.findByIdAndUpdate(messageId, {
        isRead: true,
        repliedAt: new Date(),
        repliedSubject: subject,
      });
    }

    return successResponse({
      message: `Email successfully sent to ${to}!`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
