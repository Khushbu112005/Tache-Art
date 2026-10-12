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
      } catch {
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

    // Upload to Cloudinary via stream (much faster than base64)
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "tache-artworks",
          resource_type: "image",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(buffer);
    });

    return uploadResult.secure_url;
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
