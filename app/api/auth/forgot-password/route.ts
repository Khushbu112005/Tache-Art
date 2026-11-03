import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { EmailService } from "@/services/email.service";
import {
  messageResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { isValidEmail } from "@/utils/validation";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const email = (data.email || "").toString().trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return errorResponse("Please enter a valid email address.", 400);
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (user) {
      // Generate secure 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      user.resetPasswordToken = resetCode;
      user.resetPasswordExpires = expiresAt;
      await user.save();

      console.log(`[ForgotPassword] Generated reset code for ${email}: ${resetCode}`);

      // Send email
      try {
        if (EmailService.isConfigured()) {
          await EmailService.sendPasswordResetEmail(user.name, user.email, resetCode);
          console.log(`[ForgotPassword] Reset email successfully sent to ${email}`);
        } else {
          console.warn(`[ForgotPassword] EmailService not configured. Reset code for testing: ${resetCode}`);
        }
      } catch (emailErr) {
        console.error("[ForgotPassword] Error sending password reset email:", emailErr);
      }
    } else {
      console.log(`[ForgotPassword] Password reset requested for non-existing email: ${email}`);
    }

    // Always return success for security (prevents account enumeration)
    return messageResponse(
      "If an account with that email exists, a 6-digit password reset code has been sent to your inbox.",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

