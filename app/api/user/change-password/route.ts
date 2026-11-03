import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { EmailService } from "@/services/email.service";
import {
  messageResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse("Unauthorized. Please log in to change your password.", 401);
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return errorResponse("Both current password and new password are required.", 400);
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return errorResponse("New password must be at least 6 characters long.", 400);
    }

    await dbConnect();

    const user = await User.findOne({
      email: session.user.email.toLowerCase(),
    });

    if (!user) {
      return errorResponse("User account not found.", 404);
    }

    // Verify current password
    const isCurrentMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentMatch) {
      return errorResponse("The current password you entered is incorrect.", 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse("Your new password cannot be the same as your current password.", 400);
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Send confirmation email
    try {
      if (EmailService.isConfigured() && user.email) {
        await EmailService.sendPasswordChangedNotification(user.name, user.email);
      }
    } catch (emailErr) {
      console.error("[ChangePassword] Failed to send notification email:", emailErr);
    }

    return messageResponse("Password has been changed successfully.", 200);
  } catch (error) {
    return handleApiError(error);
  }
}

