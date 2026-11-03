import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
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
    const code = (data.code || "").toString().trim();
    const newPassword = (data.newPassword || "").toString();

    if (!email || !isValidEmail(email)) {
      return errorResponse("Please provide a valid email address.", 400);
    }

    if (!code) {
      return errorResponse("Verification code is required.", 400);
    }

    if (!newPassword || newPassword.length < 6) {
      return errorResponse("New password must be at least 6 characters long.", 400);
    }

    await dbConnect();

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(
        "Invalid or expired verification code. Please request a new reset code.",
        400
      );
    }

    // Hash new password and clear token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      if (EmailService.isConfigured() && user.email) {
        await EmailService.sendPasswordChangedNotification(user.name, user.email);
      }
    } catch (emailErr) {
      console.error("[ResetPassword] Error sending confirmation email:", emailErr);
    }

    return messageResponse(
      "Your password has been reset successfully. You can now sign in.",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

