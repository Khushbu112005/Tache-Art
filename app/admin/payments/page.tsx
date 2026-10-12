"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Search,
  RefreshCw,
  CreditCard,
  DollarSign,
  AlertTriangle,
  X,
} from "lucide-react";

interface Payment {
  _id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  utrNumber?: string;
  screenshotUrl?: string;
  senderUpi?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId: { name: string; email: string } | null;
  artworkId: { title: string; price: number; imageUrl?: string } | null;
  orderRef?: { _id: string; artworkType: string; status: string } | null;
  notes?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending_verification" | "paid" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Screenshot modal preview state
  const [previewScreenshot, setPreviewScreenshot] = useState<{
    url: string;
    paymentId: string;
    customerName: string;
    amount: number;
    utr?: string;
  } | null>(null);

  // Reject modal state
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.success) {
            setPayments(data.data);
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerify = async (paymentId: string, action: "approve" | "reject", reason?: string) => {
    try {
      setActionLoading(paymentId);
      const res = await fetch(`/api/payments/${paymentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update payment status");
      }

      setPreviewScreenshot(null);
      setRejectingPayment(null);
      setRejectReason("");
      await fetchPayments();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  // KPI Calculations
  const totalVerifiedRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingVerificationCount = payments.filter(
    (p) => p.status === "pending_verification"
  ).length;

  const totalTransactions = payments.length;

  // Filtered payments
  const filteredPayments = payments.filter((payment) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "pending_verification"
        ? payment.status === "pending_verification"
        : activeTab === "paid"
        ? payment.status === "paid"
        : payment.status === "rejected" || payment.status === "failed";

    const customerName = payment.customerName || payment.userId?.name || "";
    const customerEmail = payment.customerEmail || payment.userId?.email || "";
    const utr = payment.utrNumber || payment.paymentId || "";
    const orderId = payment.orderId || "";

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          orderId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-black">
            Payment History & Verification
          </h1>
          <p className="text-xs text-gray-500 tracking-wider mt-1">
            Review manual UPI bank receipts, approve transactions & view payment revenue
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">
              Verified Revenue
            </p>
            <p className="text-xl sm:text-2xl font-bold text-black">
              ₹{totalVerifiedRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">
              Pending Verification
            </p>
            <p className="text-xl sm:text-2xl font-bold text-amber-700">
              {pendingVerificationCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-brand-burgundy/5 rounded-xl text-brand-burgundy shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">
              Total Transactions
            </p>
            <p className="text-xl sm:text-2xl font-bold text-black">{totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-[#2E292E] text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({payments.length})
          </button>

          <button
            onClick={() => setActiveTab("pending_verification")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "pending_verification"
                ? "bg-amber-600 text-white shadow"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span>Pending Verification</span>
            {pendingVerificationCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingVerificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("paid")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "paid"
                ? "bg-green-600 text-white shadow"
                : "bg-green-50 text-green-800 hover:bg-green-100"
            }`}
          >
            Verified Paid
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "rejected"
                ? "bg-red-600 text-white shadow"
                : "bg-red-50 text-red-800 hover:bg-red-100"
            }`}
          >
            Rejected / Failed
          </button>
        </div>

        <div className="relative w-full md:w-auto md:min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments by customer, UTR..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white"
          />
        </div>
      </div>

      {/* Main Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-gray-600 border-b border-gray-100">
                <th className="px-6 py-4 font-bold">Ref / Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Artwork / Details</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">UTR & Screenshot</th>
                <th className="px-6 py-4 font-bold">Status & Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-xs tracking-wider">
                    LOADING PAYMENTS...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500 text-sm">
                    <p className="font-bold uppercase tracking-wider mb-1">No Payments Found</p>
                    <p className="text-gray-400 text-xs">Payments will appear here when collectors place UPI orders.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const isPending = payment.status === "pending_verification";
                  const utr = payment.utrNumber || payment.paymentId;
                  const customerName = payment.customerName || payment.userId?.name || "Collector";
                  const customerEmail = payment.customerEmail || payment.userId?.email || "—";
                  const customerPhone = payment.customerPhone || "";

                  return (
                    <tr
                      key={payment._id}
                      className={`hover:bg-gray-50/80 transition-colors align-top ${
                        isPending ? "bg-amber-50/30" : ""
                      }`}
                    >
                      {/* 1. Order ID */}
                      <td className="px-6 py-5">
                        <p className="text-xs font-mono font-bold text-gray-800">
                          {payment.orderId || `#${payment._id.slice(-6)}`}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded">
                          {payment.paymentMethod === "manual_upi" ? "Manual UPI" : payment.paymentMethod || "Gateway"}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      {/* 2. Customer */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-black">{customerName}</p>
                        <p className="text-xs text-gray-500">{customerEmail}</p>
                        {customerPhone && <p className="text-xs text-gray-400">{customerPhone}</p>}
                      </td>

                      {/* 3. Artwork Details */}
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-black uppercase tracking-wide">
                          {payment.artworkId?.title || payment.notes || "Artwork Purchase"}
                        </p>
                        {payment.orderRef && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Order: #{payment.orderRef._id.slice(-6)}
                          </p>
                        )}
                      </td>

                      {/* 4. Amount */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-brand-burgundy">
                          ₹{payment.amount?.toLocaleString("en-IN")}
                        </p>
                      </td>

                      {/* 5. UTR & Proof */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 max-w-[200px]">
                          {utr ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-gray-800 select-all">
                                {utr}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(utr, payment._id)}
                                className="text-gray-400 hover:text-black p-0.5"
                                title="Copy UTR"
                              >
                                {copiedId === payment._id ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No UTR</span>
                          )}

                          {payment.screenshotUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewScreenshot({
                                  url: payment.screenshotUrl!,
                                  paymentId: payment._id,
                                  customerName,
                                  amount: payment.amount,
                                  utr,
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-xs text-brand-burgundy font-semibold hover:underline pt-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          ) : null}
                        </div>
                      </td>

                      {/* 6. Status & Actions */}
                      <td className="px-6 py-5">
                        {isPending ? (
                          <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                              <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                              <span>Pending Verification</span>
                            </span>

                            <div className="flex flex-col gap-1 pt-1">
                              <button
                                type="button"
                                disabled={actionLoading === payment._id}
                                onClick={() => handleVerify(payment._id, "approve")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{actionLoading === payment._id ? "Verifying..." : "Approve Payment"}</span>
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading === payment._id}
                                onClick={() => setRejectingPayment(payment)}
                                className="px-3 py-1 text-red-600 border border-red-200 hover:bg-red-50 rounded text-xs font-medium uppercase tracking-wider transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : payment.status === "paid" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid & Verified</span>
                            </span>
                            {payment.verifiedAt && (
                              <p className="text-[10px] text-gray-400">
                                Verified: {new Date(payment.verifiedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>{payment.status}</span>
                            </span>
                            {payment.rejectionReason && (
                              <p className="text-[10px] text-red-500 max-w-xs">{payment.rejectionReason}</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            <div className="p-3 sm:p-4 bg-[#2E292E] text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#E6C687]">
                  Payment Screenshot
                </h3>
                <p className="text-[11px] text-gray-300">
                  {previewScreenshot.customerName} • ₹{previewScreenshot.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewScreenshot.utr && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-semibold">Transaction UTR:</span>
                <span className="font-mono font-bold text-amber-950 text-sm select-all">
                  {previewScreenshot.utr}
                </span>
              </div>
            )}

            <div className="p-3 sm:p-4 flex-1 overflow-auto flex items-center justify-center bg-[#1A161A]">
              <div className="relative max-w-full max-h-[55vh] h-[55vh] w-full">
                <Image
                  src={previewScreenshot.url}
                  alt="Payment Screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <a
                href={previewScreenshot.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-600 hover:text-black font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewScreenshot(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 flex-1 sm:flex-initial"
                >
                  Close
                </button>
                {(() => {
                  const targetPayment = payments.find((p) => p._id === previewScreenshot.paymentId);
                  if (targetPayment && targetPayment.status === "pending_verification") {
                    return (
                      <button
                        type="button"
                        onClick={() => handleVerify(targetPayment._id, "approve")}
                        className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Payment</span>
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Reject Payment</span>
              </h3>
              <button
                onClick={() => setRejectingPayment(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              State the reason why payment verification was rejected:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UTR not matching with bank transaction records..."
              className="w-full p-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(rejectingPayment._id, "reject", rejectReason.trim())}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors text-center"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
