export interface IPayment {
  _id: string;
  userId: string;
  orderId: string;       // Razorpay order ID
  paymentId?: string;    // Razorpay payment ID
  signature?: string;    // Razorpay signature
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  artworkId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateOrderInput {
  amount: number;
  currency?: string;
  artworkId?: string;
  notes?: Record<string, string>;
}

export interface IRazorpayVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface IRazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}
