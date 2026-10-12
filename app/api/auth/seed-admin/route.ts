import { NextRequest } from "next/server";
import { UserService } from "@/services/user.service";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import {
  messageResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";

export async function GET() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Aastha Jain";

    if (!email || !password) {
      return errorResponse(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables",
        400
      );
    }

    await dbConnect();
    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      existing.name = name;
      existing.password = hashedPassword;
      existing.role = "admin";
      await existing.save();
      return messageResponse(`Admin account (${email}) successfully verified and updated`, 200);
    }

    await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });

    return messageResponse(`Admin account (${email}) successfully created in database`, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

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
