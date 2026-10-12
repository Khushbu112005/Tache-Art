"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, XCircle, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Order {
  _id: string;
  artworkType: string;
  size: string;
  status: string;
  priority?: string;
  message?: string;
  totalAmount?: number;
  utrNumber?: string;
  paymentScreenshot?: string;
  createdAt: string;
}

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOrders = useCallback(() => {
    if (session?.user?.id) {
      setLoading(true);
      fetch("/api/orders?user=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingCancel(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/orders/${cancellingOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reason: cancelReason || "Cancelled by customer",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Order #${cancellingOrder._id.slice(-6).toUpperCase()} has been successfully cancelled.`,
        });
        setCancellingOrder(null);
        setCancelReason("");
        fetchOrders();
      } else {
        setFeedbackMessage({
          type: "error",
          text: data.error || "Unable to cancel order. Please contact support.",
        });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: "error",
        text: "Network error occurred while cancelling order.",
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    payment_pending_verification: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <span className="text-[9px] tracking-[0.3em] text-brand-burgundy font-bold uppercase block mb-1">
            Acquisitions & Orders
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.1em] text-[#2E292E] uppercase font-serif">
            Purchased Artworks & Orders
          </h1>
        </div>

        <Link
          href="/gallery"
          className="bg-[#2E292E] hover:bg-brand-burgundy text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase rounded-full transition-all shadow-sm self-start sm:self-auto text-center"
        >
          + Explore Gallery
        </Link>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            feedbackMessage.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-gray-400 hover:text-gray-700 text-sm font-bold px-2 py-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#2E292E] uppercase">
              Order History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">
              Total {orders.length} order{orders.length === 1 ? "" : "s"} recorded
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#FBFBFB] p-6 rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 sm:py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Package size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2E292E] uppercase tracking-widest">
                No orders placed yet
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto uppercase tracking-wide">
                Your collection history will appear here once you place an order.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-block px-10 py-4 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-full shadow-md hover:bg-[#2E292E] transition-all"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const canCancel =
                order.status === "pending" || order.status === "payment_pending_verification";

              return (
                <div
                  key={order._id}
                  className="bg-[#FBFBFB] p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-[#2E292E] uppercase tracking-wide">
                          {order.artworkType}
                        </h4>
                        <span
                          className={`px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                            statusColors[order.status] || "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {order.status === "payment_pending_verification"
                            ? "Payment Pending Verification"
                            : order.status}
                        </span>
                        {order.totalAmount && (
                          <span className="text-xs font-bold text-brand-burgundy px-2 py-0.5 bg-brand-burgundy/5 rounded-full">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 font-medium">Size: {order.size}</p>

                      {order.utrNumber && (
                        <p className="text-[11px] font-mono text-gray-500">
                          UTR / Ref: <span className="font-bold text-gray-700">{order.utrNumber}</span>
                        </p>
                      )}

                      {order.status === "payment_pending_verification" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mt-2 max-w-lg">
                          <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                            <span>Verification in Progress</span>
                          </p>
                          <p className="text-[10px] text-amber-800 mt-1 leading-relaxed">
                            We are verifying your transaction with our bank account. Your order will be confirmed once received.
                          </p>
                        </div>
                      )}

                      {order.status === "cancelled" && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 mt-2 max-w-lg">
                          <p className="font-semibold text-[11px] flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Order Cancelled</span>
                          </p>
                        </div>
                      )}

                      {order.message && (
                        <p className="text-xs text-gray-400 italic line-clamp-2 max-w-lg">
                          &quot;{order.message}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-3">
                      <div className="sm:text-right">
                        <p className="text-xs font-mono text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Cancel Order Action Button */}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReason("");
                          }}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors flex items-center justify-center gap-1.5 self-start sm:self-end"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CANCELLATION MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#2E292E] uppercase tracking-wide">
                  Cancel Order
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Order #{cancellingOrder._id.slice(-8).toUpperCase()} • {cancellingOrder.artworkType}
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 text-xs text-gray-600 leading-relaxed bg-[#FAF7F2] p-3.5 sm:p-4 rounded-2xl border border-[#F0EAE1]">
              <p className="font-semibold text-gray-800">
                Are you sure you want to cancel this order?
              </p>
              <p className="text-[11px] text-gray-500">
                If you have already transferred money via UPI, please email us with your UTR at{" "}
                <span className="font-semibold text-brand-burgundy">aasthajainokok@gmail.com</span> for a prompt refund.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-1.5">
                Reason for Cancellation (Optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white mb-2"
              >
                <option value="">Select a reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Issue with payment / UPI">Issue with payment / UPI</option>
                <option value="Want to order a different artwork">Want to order a different artwork</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrder(null)}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-100 rounded-full transition-colors text-center"
              >
                Keep Order
              </button>

              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-widest uppercase rounded-full transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-center"
              >
                {isSubmittingCancel ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
