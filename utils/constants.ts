// ─── Order Statuses ───
export const ORDER_STATUSES = [
  "pending",
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
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ─── Currency ───
export const DEFAULT_CURRENCY = "INR";

// ─── Pagination ───
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// ─── User Roles ───
export const USER_ROLES = ["admin", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];
