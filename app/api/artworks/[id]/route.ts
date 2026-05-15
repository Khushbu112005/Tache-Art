import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArtworkService } from "@/services/artwork.service";
import {
  successResponse,
  messageResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { isValidObjectId } from "@/utils/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid artwork ID", 400);
    }

    const artwork = await ArtworkService.getById(id);
    return successResponse(artwork);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid artwork ID", 400);
    }

    const data = await req.json();
    const artwork = await ArtworkService.update(id, data);
    return successResponse(artwork);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid artwork ID", 400);
    }

    await ArtworkService.delete(id);
    return messageResponse("Deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
