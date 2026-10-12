import { NextRequest } from "next/server";
import { UserService } from "@/services/user.service";
import {
  messageResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { name, email, password, adminKey } = data;

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required", 400);
    }

    // Verification key for security
    const expectedKey = process.env.ADMIN_SEED_KEY || "seed-admin-secret";
    if (adminKey !== expectedKey) {
      return errorResponse("Invalid admin seed key", 403);
    }

    await UserService.create(name, email, password, "admin");

    return messageResponse("Admin account created successfully in database", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
