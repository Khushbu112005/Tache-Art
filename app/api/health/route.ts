import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    // Attempt database connection check
    await dbConnect();

    return successResponse({
      status: "online",
      message: "Tache Backend API is running smoothly",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        server: "active",
      },
    });
  } catch (error) {
    return errorResponse(
      `Backend running, but database connection failed: ${(error as Error).message}`,
      500
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
