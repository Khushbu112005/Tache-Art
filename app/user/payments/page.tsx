"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentRecord {
  _id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  artworkId?: {
    _id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

export default function UserPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true);
      fetch("/api/payments?user=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPayments(data.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const statusColors: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending_verification: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    created: "bg-gray-50 text-gray-700 border-gray-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <span className="text-[9px] tracking-[0.3em] text-brand-burgundy font-bold uppercase block mb-1">
            Receipts & Invoices
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.1em] text-[#2E292E] uppercase font-serif">
            Payment & Transaction History
          </h1>
        </div>

        <Link
          href="/gallery"
          className="bg-[#2E292E] hover:bg-brand-burgundy text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase rounded-full transition-all shadow-sm self-start sm:self-auto text-center"
        >
          + Explore Gallery
        </Link>
      </div>

      {/* Payments List */}
      <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#2E292E] uppercase">
              Transaction Records
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">
              Total {payments.length} transaction{payments.length === 1 ? "" : "s"} recorded
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
        ) : payments.length === 0 ? (
          <div className="py-16 sm:py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <CreditCard size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2E292E] uppercase tracking-widest">
                No payment records found
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto uppercase tracking-wide">
                Transactions made via UPI or online checkout will be recorded here.
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
            {payments.map((p) => (
              <div
                key={p._id}
                className="bg-[#FBFBFB] p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-[#2E292E] uppercase tracking-wide">
                        {p.artworkId?.title || "Artwork Purchase"}
                      </h4>
                      <span
                        className={`px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                          statusColors[p.status] || "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {p.status === "pending_verification"
                          ? "Pending Verification"
                          : p.status === "paid"
                          ? "Verified / Paid"
                          : p.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-gray-500">Order ID: #{p.orderId.slice(-8).toUpperCase()}</p>
                    {p.paymentId && (
                      <p className="text-xs font-mono text-gray-400">Ref: {p.paymentId}</p>
                    )}

                    {p.status === "pending_verification" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 mt-2 max-w-md">
                        <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                          <Clock size={12} className="text-amber-700" />
                          <span>Under Verification</span>
                        </p>
                        <p className="text-[10px] text-amber-800 mt-0.5">
                          Bank confirmation in progress. Thank you for your patience!
                        </p>
                      </div>
                    )}

                    {p.status === "paid" && (
                      <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold pt-1">
                        <CheckCircle size={12} /> Payment verified and confirmed
                      </p>
                    )}

                    {p.status === "rejected" && (
                      <p className="text-[10px] text-rose-700 flex items-center gap-1 font-semibold pt-1">
                        <AlertCircle size={12} /> Payment rejected or cancelled
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right space-y-1 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <p className="text-base sm:text-lg font-bold text-brand-burgundy">
                      ₹{p.amount?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
