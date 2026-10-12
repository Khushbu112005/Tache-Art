export interface IOrder {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
  artworkType: string;
  size: string;
  message: string;
  referenceImage?: string;
  artworkId?: string | { _id: string; title: string; price: number; imageUrl?: string };
  status: "pending" | "payment_pending_verification" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  deadline?: string;
  tags: string[];
  totalAmount?: number;
  paymentStatus?: "unpaid" | "pending_verification" | "paid" | "rejected";
  paymentMethod?: string;
  utrNumber?: string;
  paymentScreenshot?: string;
  senderUpi?: string;
  paymentId?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderInput {
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
  artworkType: string;
  size: string;
  message: string;
  referenceImage?: string;
  artworkId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  deadline?: string;
  tags?: string[];
  totalAmount?: number;
  paymentStatus?: "unpaid" | "pending_verification" | "paid" | "rejected";
  paymentMethod?: string;
  utrNumber?: string;
  paymentScreenshot?: string;
  senderUpi?: string;
  status?: "pending" | "payment_pending_verification" | "in-progress" | "completed" | "cancelled";
}

