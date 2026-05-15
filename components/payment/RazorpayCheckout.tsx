"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RazorpayCheckoutProps {
  amount: number;
  artworkId?: string;
  artworkTitle?: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export default function RazorpayCheckout({
  amount,
  artworkId,
  artworkTitle,
  onSuccess,
  onFailure,
}: RazorpayCheckoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setStatus("processing");

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Create order on backend
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          artworkId,
          notes: { artworkTitle: artworkTitle || "" },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { orderId, amount: amountInPaise, currency } = orderData.data;

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency,
        name: "TACHÈ Art Studio",
        description: artworkTitle || "Custom Artwork Purchase",
        order_id: orderId,
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
        },
        theme: {
          color: "#8B1D1D",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify payment on backend
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.data?.verified) {
              setStatus("success");
              onSuccess?.();
            } else {
              setStatus("failed");
              onFailure?.("Payment verification failed");
            }
          } catch {
            setStatus("failed");
            onFailure?.("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      setStatus("failed");
      onFailure?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold tracking-widest uppercase text-[#2E292E]">Payment Successful</h3>
        <p className="text-sm text-gray-500">Thank you for your purchase! We&apos;ll be in touch shortly.</p>
        <button
          onClick={() => router.push("/profile")}
          className="px-8 py-3 bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#2E292E] transition-all duration-500 rounded-full"
        >
          View My Orders
        </button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-bold tracking-widest uppercase text-[#2E292E]">Payment Failed</h3>
        <p className="text-sm text-gray-500">Something went wrong. Please try again.</p>
        <button
          onClick={() => {
            setStatus("idle");
            setLoading(false);
          }}
          className="px-8 py-3 bg-[#2E292E] text-white text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-brand-burgundy transition-all duration-500 rounded-full"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full text-center bg-brand-burgundy text-white px-10 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#2E292E] transition-all duration-500 shadow-2xl rounded-sm disabled:opacity-50"
    >
      {loading ? "Processing..." : `PAY ₹${amount.toLocaleString("en-IN")}`}
    </button>
  );
}
