"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Palette, Clock, ExternalLink, XCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface Order {
  _id: string;
  artworkType: string;
  size: string;
  status: string;
  priority: string;
  message: string;
  referenceImage?: string;
  createdAt: string;
}

export default function UserRequestsPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingRequest, setCancellingRequest] = useState<Order | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRequests = useCallback(() => {
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
    fetchRequests();
  }, [fetchRequests]);

  const handleConfirmCancel = async () => {
    if (!cancellingRequest) return;
    setIsSubmittingCancel(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/orders/${cancellingRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reason: "Cancelled by customer request",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Commission request for "${cancellingRequest.artworkType}" has been cancelled.`,
        });
        setCancellingRequest(null);
        fetchRequests();
      } else {
        setFeedbackMessage({
          type: "error",
          text: data.error || "Unable to cancel request.",
        });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: "error",
        text: "Network error occurred while cancelling request.",
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
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <span className="text-[9px] tracking-[0.3em] text-brand-burgundy font-bold uppercase block mb-1">
            Bespoke Commissions
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.1em] text-[#2E292E] uppercase font-serif">
            Custom Artwork Requests
          </h1>
        </div>

        <Link
          href="/order"
          className="bg-[#2E292E] hover:bg-brand-burgundy text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase rounded-full transition-all shadow-sm self-start sm:self-auto text-center"
        >
          + New Request
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

      {/* Requests List */}
      <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#2E292E] uppercase">
              Commission Pipeline
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">
              Total {orders.length} custom artwork request{orders.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#FBFBFB] p-6 rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 sm:py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Palette size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2E292E] uppercase tracking-widest">
                No custom requests submitted
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto uppercase tracking-wide">
                Need a bespoke painting on canvas, guitar, or fabric? Submit a custom order request to Aastha Jain.
              </p>
            </div>
            <Link
              href="/order"
              className="inline-block px-10 py-4 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-full shadow-md hover:bg-[#2E292E] transition-all"
            >
              Submit Custom Order
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {orders.map((req) => {
              const canCancel = req.status === "pending" || req.status === "payment_pending_verification";

              return (
                <div
                  key={req._id}
                  className="bg-[#FBFBFB] p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-brand-burgundy uppercase tracking-widest block">
                          Custom Commission
                        </span>
                        <h4 className="text-base font-bold text-[#2E292E] uppercase tracking-wide mt-0.5">
                          {req.artworkType}
                        </h4>
                      </div>
                      <span
                        className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${
                          statusColors[req.status] || "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="text-gray-400 uppercase tracking-widest text-[10px]">Canvas Size:</span> {req.size}</p>
                      <p><span className="text-gray-400 uppercase tracking-widest text-[10px]">Priority:</span> {req.priority || "Normal"}</p>
                    </div>

                    {req.message && (
                      <div className="p-3 bg-white rounded-xl text-xs text-gray-600 font-medium italic border border-gray-100">
                        &quot;{req.message}&quot;
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3">
                      {req.referenceImage && (
                        <a
                          href={req.referenceImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-burgundy font-bold hover:underline flex items-center gap-1"
                        >
                          View Ref <ExternalLink size={10} />
                        </a>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setCancellingRequest(req)}
                          className="text-red-500 hover:text-red-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <XCircle size={11} /> Cancel
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
      {cancellingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#2E292E] uppercase tracking-wide">
                  Cancel Commission Request
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  #{cancellingRequest._id.slice(-8).toUpperCase()} • {cancellingRequest.artworkType}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-[#F0EAE1]">
              Are you sure you want to cancel this commission request? This inquiry will be marked as cancelled in the artist pipeline.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingRequest(null)}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-100 rounded-full transition-colors"
              >
                Keep Request
              </button>

              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-widest uppercase rounded-full transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Request</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
