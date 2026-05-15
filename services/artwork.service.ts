import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import type { IArtworkFilters } from "@/types/artwork";
import { NotFoundError } from "@/utils/apiResponse";

export class ArtworkService {
  static async getAll(filters: IArtworkFilters = {}) {
    await dbConnect();

    const query: Record<string, unknown> = {};

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Medium filter
    if (filters.medium) {
      query.medium = filters.medium;
    }

    // Priority filter
    if (filters.priority) {
      query.priority = filters.priority;
    }

    // Sold status
    if (filters.isSold !== undefined) {
      query.isSold = filters.isSold;
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        (query.price as Record<string, number>).$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (query.price as Record<string, number>).$lte = filters.maxPrice;
      }
    }

    // Don't show archived artworks in public queries
    if (!filters.priority) {
      query.priority = { $ne: "archived" };
    }

    // Sort
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (filters.sortBy) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const [artworks, total] = await Promise.all([
      Artwork.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
      Artwork.countDocuments(query),
    ]);

    return {
      artworks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    await dbConnect();
    const artwork = await Artwork.findById(id).lean();
    if (!artwork) throw new NotFoundError("Artwork");
    return artwork;
  }

  static async create(data: Record<string, unknown>) {
    await dbConnect();
    const artwork = new Artwork(data);
    await artwork.save();
    return artwork;
  }

  static async update(id: string, data: Record<string, unknown>) {
    await dbConnect();
    const artwork = await Artwork.findByIdAndUpdate(id, data, { new: true });
    if (!artwork) throw new NotFoundError("Artwork");
    return artwork;
  }

  static async delete(id: string) {
    await dbConnect();
    const artwork = await Artwork.findByIdAndDelete(id);
    if (!artwork) throw new NotFoundError("Artwork");
    return artwork;
  }

  static async getFeatured(limit = 6) {
    await dbConnect();
    return Artwork.find({ priority: { $ne: "archived" } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getCategories() {
    await dbConnect();
    return Artwork.distinct("category");
  }

  static async getStats() {
    await dbConnect();
    const [total, featured, sold] = await Promise.all([
      Artwork.countDocuments(),
      Artwork.countDocuments({ priority: "featured" }),
      Artwork.countDocuments({ isSold: true }),
    ]);
    return { total, featured, sold };
  }
}
