import { NextRequest } from "next/server";
import { UserService } from "@/services/user.service";
import { EmailService } from "@/services/email.service";
import {
  messageResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { validateSignupInput } from "@/utils/validation";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validation = validateSignupInput(data);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400);
    }

    await UserService.create(data.name, data.email, data.password);

    // Send confirmation email containing user credentials
    try {
      if (EmailService.isConfigured()) {
        await EmailService.sendSignupConfirmation(
          data.name,
          data.email,
          data.password
        );
        console.log(`[Signup] Confirmation email sent successfully to ${data.email}`);
      } else {
        console.warn(
          "[Signup] EmailService is not configured. Missing EMAIL_SERVER_USER/EMAIL_SERVER_PASSWORD."
        );
      }
    } catch (emailError) {
      // Log the error but don't fail the registration request if SMTP dispatch encounters an issue
      console.error("[Signup] Failed to send registration confirmation email:", emailError);
    }

    return messageResponse("Account created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
