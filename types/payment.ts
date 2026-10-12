export interface IPayment {
  _id: string;
  userId?: string | { _id: string; name: string; email: string };
  orderId: string;       // UPI reference ID or Razorpay order ID
  paymentId?: string;    // UTR number or Razorpay payment ID
  signature?: string;    // Razorpay signature
  amount: number;
  currency: string;
  status: "created" | "pending_verification" | "paid" | "failed" | "refunded" | "rejected";
  paymentMethod?: string; // "manual_upi" | "razorpay"
  utrNumber?: string;
  screenshotUrl?: string;
  senderUpi?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  artworkId?: string | { _id: string; title: string; price: number; imageUrl?: string };
  orderRef?: string | { _id: string; artworkType: string; status: string };
  notes?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface IManualUpiPaymentInput {
  orderId?: string;
  amount: number;
  artworkId?: string;
  artworkTitle?: string;
  name: string;
  email: string;
  phone: string;
  shippingAddress?: string;
  utrNumber: string;
  screenshotUrl: string;
  senderUpi?: string;
  notes?: string;
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

