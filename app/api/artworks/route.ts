import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArtworkService } from "@/services/artwork.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/utils/apiResponse";
import { validateArtworkInput } from "@/utils/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      medium: searchParams.get("medium") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      priority: searchParams.get("priority") || undefined,
      sortBy: (searchParams.get("sortBy") as "price_asc" | "price_desc" | "newest" | "oldest") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
    };

    const result = await ArtworkService.getAll(filters);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    const data = await req.json();
    const validation = validateArtworkInput(data);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400);
    }

    const artwork = await ArtworkService.create(data);
    return successResponse(artwork, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
