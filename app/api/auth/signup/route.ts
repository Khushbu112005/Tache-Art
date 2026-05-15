import { NextRequest } from "next/server";
import { UserService } from "@/services/user.service";
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

    return messageResponse("Account created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
