import { writeFile, mkdir } from "fs/promises";
import path from "path";
import cloudinary from "@/lib/cloudinary";
import { ValidationError } from "@/utils/apiResponse";
import { validateImageFile } from "@/utils/validation";

export class UploadService {
  /**
   * Upload an image file to Cloudinary (or local filesystem fallback if unconfigured)
   */
  static async uploadImage(file: File): Promise<string> {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(", "));
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Cloudinary is actually configured, otherwise fallback to local upload
    if (
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === "your_api_key"
    ) {
      console.log("Cloudinary not configured, falling back to local storage");
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Ignore if directory already exists
      }

      // Generate a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = file.name.split(".").pop();
      const filename = `artwork-${uniqueSuffix}.${ext}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);

      // Return the public URL path
      return `/uploads/${filename}`;
    }

    // Convert file to base64 data URL for Cloudinary
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "tache-artworks",
      resource_type: "image",
      transformation: [
        { quality: "auto:best" },
        { fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  }

  /**
   * Delete an image from Cloudinary by URL
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract public_id from URL
      const urlParts = imageUrl.split("/");
      const folderIndex = urlParts.findIndex((p) => p === "tache-artworks");
      if (folderIndex >= 0) {
        const publicId = urlParts
          .slice(folderIndex)
          .join("/")
          .replace(/\.[^.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }
  }
}
