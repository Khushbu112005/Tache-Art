import { Types } from "mongoose";

// ─── Primitive Validators ───

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && Types.ObjectId.isValid(id);
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0 && isFinite(value);
}

// ─── Domain Validators ───

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSignupInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.name)) errors.push("Name is required");
  if (!isValidEmail(data.email)) errors.push("Valid email is required");
  if (!isNonEmptyString(data.password)) errors.push("Password is required");
  else if (typeof data.password === "string" && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return { valid: errors.length === 0, errors };
}

export function validateArtworkInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.title)) errors.push("Title is required");
  if (!isNonEmptyString(data.description)) errors.push("Description is required");
  if (!isNonEmptyString(data.imageUrl)) errors.push("Image URL is required");
  if (!isPositiveNumber(data.price)) errors.push("Price must be a positive number");
  if (!isNonEmptyString(data.category)) errors.push("Category is required");

  return { valid: errors.length === 0, errors };
}

export function validateOrderInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.name)) errors.push("Name is required");
  if (!isValidEmail(data.email)) errors.push("Valid email is required");
  if (!isNonEmptyString(data.artworkType)) errors.push("Artwork type is required");
  if (!isNonEmptyString(data.size)) errors.push("Size is required");
  if (!isNonEmptyString(data.message)) errors.push("Message is required");

  return { valid: errors.length === 0, errors };
}

export function validateContactInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.name)) errors.push("Name is required");
  if (!isValidEmail(data.email)) errors.push("Valid email is required");
  if (!isNonEmptyString(data.message)) errors.push("Message is required");

  return { valid: errors.length === 0, errors };
}

export function validatePaymentVerification(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.razorpay_order_id)) errors.push("Order ID is required");
  if (!isNonEmptyString(data.razorpay_payment_id)) errors.push("Payment ID is required");
  if (!isNonEmptyString(data.razorpay_signature)) errors.push("Signature is required");

  return { valid: errors.length === 0, errors };
}

// ─── File Validation ───

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push("File must be an image (JPEG, PNG, WebP, or GIF)");
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push("File size must be less than 10MB");
  }

  return { valid: errors.length === 0, errors };
}
