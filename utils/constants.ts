// ─── Order Statuses ───
export const ORDER_STATUSES = [
  "pending",
  "payment_pending_verification",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ─── Order Priorities ───
export const ORDER_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type OrderPriority = (typeof ORDER_PRIORITIES)[number];

// ─── Artwork Priorities ───
export const ARTWORK_PRIORITIES = ["featured", "normal", "archived"] as const;
export type ArtworkPriority = (typeof ARTWORK_PRIORITIES)[number];

// ─── Artwork Categories ───
export const ARTWORK_CATEGORIES = [
  "Canvas Painting",
  "Watercolor",
  "Abstract Collage",
  "Sketch",
  "Portrait",
  "Digital Art",
  "Fabric Art",
  "Instruments",
  "Other",
] as const;

// ─── Artwork Mediums ───
export const ARTWORK_MEDIUMS = [
  "Oil",
  "Acrylic",
  "Watercolor",
  "Mixed Media",
  "Charcoal",
  "Ink",
  "Digital",
  "Other",
] as const;

// ─── Payment Statuses ───
export const PAYMENT_STATUSES = [
  "created",
  "pending_verification",
  "paid",
  "failed",
  "refunded",
  "rejected",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ─── Currency ───
export const DEFAULT_CURRENCY = "INR";

// ─── UPI Defaults ───
export const DEFAULT_UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "aasthajainokok@oksbi";
export const DEFAULT_UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || "AASTHA JAIN";
export const DEFAULT_UPI_QR_IMAGE = process.env.NEXT_PUBLIC_UPI_QR_IMAGE || "/upi-qr.jpg";

// ─── Pagination ───
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// ─── User Roles ───
export const USER_ROLES = ["admin", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

