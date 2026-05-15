export interface IOrder {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  artworkType: string;
  size: string;
  message: string;
  referenceImage?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  deadline?: string;
  tags: string[];
  totalAmount?: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderInput {
  name: string;
  email: string;
  artworkType: string;
  size: string;
  message: string;
  referenceImage?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  deadline?: string;
  tags?: string[];
  totalAmount?: number;
}
