"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Search,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";

interface Order {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
  artworkType: string;
  size: string;
  message: string;
  referenceImage?: string;
  status: string;
  priority: string;
  totalAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  utrNumber?: string;
  paymentScreenshot?: string;
  senderUpi?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  artworkId?: { _id: string; title: string; price: number; imageUrl?: string } | null;
  paymentId?: { _id: string; status: string; utrNumber: string; screenshotUrl: string; senderUpi: string } | null;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending_verification" | "in-progress" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Screenshot modal preview state
  const [previewScreenshot, setPreviewScreenshot] = useState<{
    url: string;
    orderId: string;
    customerName: string;
    amount?: number;
    utr?: string;
  } | null>(null);

  // Rejection modal state
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.success ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setOrders(data.success ? data.data : []);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch orders:", error);
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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprovePayment = async (order: Order) => {
    if (!window.confirm(`Confirm payment received for Order #${order._id.slice(-6)} (₹${order.totalAmount || 0}) from ${order.name}?`)) {
      return;
    }

    try {
      setActionLoading(order._id);

      // If linked payment exists, verify payment endpoint
      if (order.paymentId?._id) {
        const paymentRes = await fetch(`/api/payments/${order.paymentId._id}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }),
        });
        if (!paymentRes.ok) throw new Error("Failed to approve payment");
      } else {
        // Fallback: update order directly
        const res = await fetch(`/api/orders/${order._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "in-progress",
            paymentStatus: "paid",
          }),
        });
        if (!res.ok) throw new Error("Failed to update order");
      }

      setPreviewScreenshot(null);
      await fetchOrders();
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Error approving payment. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectingOrder) return;

    try {
      setActionLoading(rejectingOrder._id);

      if (rejectingOrder.paymentId?._id) {
        await fetch(`/api/payments/${rejectingOrder.paymentId._id}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            reason: rejectReason.trim() || "Payment verification rejected",
          }),
        });
      } else {
        await fetch(`/api/orders/${rejectingOrder._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelled",
            paymentStatus: "rejected",
            rejectionReason: rejectReason.trim() || "Payment verification rejected",
          }),
        });
      }

      setRejectingOrder(null);
      setRejectReason("");
      setPreviewScreenshot(null);
      await fetchOrders();
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Error rejecting payment.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered orders
  const pendingVerificationCount = orders.filter(
    (o) => o.status === "payment_pending_verification"
  ).length;

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "pending_verification"
        ? order.status === "payment_pending_verification"
        : order.status === activeTab;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : (order.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.utrNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.artworkType || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-black">
            Manage Orders
          </h1>
          <p className="text-xs text-gray-500 tracking-wider mt-1">
            Track customer orders, verify manual UPI payments & update fulfillment
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Verification Alert Banner if there are pending orders */}
      {pendingVerificationCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                {pendingVerificationCount} Order{pendingVerificationCount > 1 ? "s" : ""} Awaiting UPI Payment Verification
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Check your UPI bank app / statement to confirm the UTR numbers and approve the orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("pending_verification")}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0 shadow"
          >
            Review Pending ({pendingVerificationCount})
          </button>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-[#2E292E] text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("pending_verification")}
            className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "pending_verification"
                ? "bg-amber-600 text-white shadow"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span>Payment Pending</span>
            {pendingVerificationCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingVerificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("in-progress")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "in-progress"
                ? "bg-blue-600 text-white shadow"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "completed"
                ? "bg-green-600 text-white shadow"
                : "bg-green-50 text-green-800 hover:bg-green-100"
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "cancelled"
                ? "bg-red-600 text-white shadow"
                : "bg-red-50 text-red-800 hover:bg-red-100"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-auto md:min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, UTR, art..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-gray-600 border-b border-gray-100">
                <th className="px-6 py-4 font-bold">Order Details</th>
                <th className="px-6 py-4 font-bold">Customer Info</th>
                <th className="px-6 py-4 font-bold">Payment & UTR Verification</th>
                <th className="px-6 py-4 font-bold">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400 tracking-wider text-xs">
                    LOADING ORDERS...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500 text-sm">
                    <p className="font-bold uppercase tracking-wider mb-1">No Orders Found</p>
                    <p className="text-gray-400 text-xs">Try selecting a different filter tab or clear search query.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPendingVerification = order.status === "payment_pending_verification";
                  const screenshot = order.paymentScreenshot || order.referenceImage;
                  const utr = order.utrNumber || order.paymentId?.utrNumber;

                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50/80 transition-colors align-top ${
                        isPendingVerification ? "bg-amber-50/30" : ""
                      }`}
                    >
                      {/* 1. Order Details */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-400">
                              #{order._id.slice(-6)}
                            </span>
                            {order.totalAmount && (
                              <span className="text-xs font-bold text-brand-burgundy px-2 py-0.5 bg-brand-burgundy/5 rounded-full">
                                ₹{order.totalAmount.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-black uppercase tracking-wide">
                            {order.artworkType}
                          </p>
                          <p className="text-xs text-gray-500">Size: {order.size}</p>
                          {order.message && (
                            <p className="text-xs text-gray-600 line-clamp-2 max-w-xs mt-2 italic bg-gray-50 p-2 rounded border border-gray-100">
                              &ldquo;{order.message}&rdquo;
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 pt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>

                      {/* 2. Customer Info */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 text-xs">
                          <p className="font-bold text-black flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{order.name}</span>
                          </p>
                          <a
                            href={`mailto:${order.email}`}
                            className="text-gray-600 hover:text-brand-burgundy transition-colors flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{order.email}</span>
                          </a>
                          {order.phone && (
                            <a
                              href={`tel:${order.phone}`}
                              className="text-gray-600 hover:text-brand-burgundy transition-colors flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{order.phone}</span>
                            </a>
                          )}
                          {order.shippingAddress && (
                            <p className="text-[11px] text-gray-500 flex items-start gap-1.5 pt-1 max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span>{order.shippingAddress}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Payment & UTR Verification */}
                      <td className="px-6 py-5">
                        <div className="space-y-2.5 max-w-xs">
                          {/* Method Badge */}
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider rounded">
                              {order.paymentMethod === "manual_upi" ? "Manual UPI" : order.paymentMethod || "Inquiry"}
                            </span>
                            {order.paymentStatus === "paid" && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider rounded">
                                Verified
                              </span>
                            )}
                          </div>

                          {/* UTR Number */}
                          {utr ? (
                            <div className="bg-white border border-gray-200 p-2 rounded-lg space-y-1 shadow-2xs">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                Transaction / UTR ID:
                              </p>
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-xs font-bold text-black select-all">
                                  {utr}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(utr, order._id)}
                                  className="text-gray-400 hover:text-black p-1 transition-colors"
                                  title="Copy UTR"
                                >
                                  {copiedId === order._id ? (
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              {order.senderUpi && (
                                <p className="text-[10px] text-gray-500">
                                  From UPI: <span className="font-mono font-medium text-black">{order.senderUpi}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No UTR submitted</p>
                          )}

                          {/* Payment Screenshot Thumbnail & Button */}
                          {screenshot ? (
                            <div className="pt-1 flex items-center gap-3">
                              <div
                                onClick={() =>
                                  setPreviewScreenshot({
                                    url: screenshot,
                                    orderId: order._id,
                                    customerName: order.name,
                                    amount: order.totalAmount,
                                    utr,
                                  })
                                }
                                className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity shrink-0 bg-gray-100"
                              >
                                <Image
                                  src={screenshot}
                                  alt="Payment Proof"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewScreenshot({
                                    url: screenshot,
                                    orderId: order._id,
                                    customerName: order.name,
                                    amount: order.totalAmount,
                                    utr,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-burgundy hover:underline"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Proof</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* 4. Status & Quick Actions */}
                      <td className="px-6 py-5">
                        <div className="space-y-3">
                          {isPendingVerification ? (
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                                <span>Payment Pending Verification</span>
                              </span>

                              {/* Direct One-Click Approval & Reject Buttons */}
                              <div className="flex flex-col gap-1.5 pt-1">
                                <button
                                  type="button"
                                  disabled={actionLoading === order._id}
                                  onClick={() => handleApprovePayment(order)}
                                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{actionLoading === order._id ? "Processing..." : "Approve Payment"}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoading === order._id}
                                  onClick={() => setRejectingOrder(order)}
                                  className="w-full py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                                >
                                  Reject / Invalid
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-black w-full ${
                                  order.status === "in-progress"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : order.status === "completed"
                                    ? "bg-green-50 text-green-800 border-green-200"
                                    : order.status === "cancelled"
                                    ? "bg-red-50 text-red-800 border-red-200"
                                    : "bg-yellow-50 text-yellow-800 border-yellow-200"
                                }`}
                              >
                                <option value="payment_pending_verification">Payment Pending</option>
                                <option value="pending">Inquiry Pending</option>
                                <option value="in-progress">In Progress (Approved)</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              {order.verifiedAt && (
                                <p className="text-[10px] text-gray-400">
                                  Verified on {new Date(order.verifiedAt).toLocaleDateString()}
                                </p>
                              )}

                              {order.rejectionReason && (
                                <p className="text-[10px] text-red-600 bg-red-50 p-1.5 rounded border border-red-100">
                                  Reason: {order.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCREENSHOT LIGHTBOX / MODAL */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-[#2E292E] text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#E6C687]">
                  Payment Verification Proof
                </h3>
                <p className="text-[11px] text-gray-300">
                  Customer: <strong className="text-white">{previewScreenshot.customerName}</strong>
                  {previewScreenshot.amount ? ` • ₹${previewScreenshot.amount.toLocaleString("en-IN")}` : ""}
                </p>
              </div>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Ribbon */}
            {previewScreenshot.utr && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-semibold">Reported UTR:</span>
                <span className="font-mono font-bold text-amber-950 text-sm select-all">{previewScreenshot.utr}</span>
              </div>
            )}

            {/* Image Preview */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#1A161A]">
              <div className="relative max-w-full max-h-[55vh] h-[55vh] w-full">
                <Image
                  src={previewScreenshot.url}
                  alt="Payment Screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Actions Footer */}
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
                  const targetOrder = orders.find((o) => o._id === previewScreenshot.orderId);
                  if (targetOrder && targetOrder.status === "payment_pending_verification") {
                    return (
                      <button
                        type="button"
                        onClick={() => handleApprovePayment(targetOrder)}
                        className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Approve</span>
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

      {/* REJECTION REASON MODAL */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Reject Payment Verification</span>
              </h3>
              <button
                onClick={() => setRejectingOrder(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Order #{rejectingOrder._id.slice(-6)} for {rejectingOrder.name}. Please enter the reason for rejection (e.g. amount not received, invalid UTR, incorrect screenshot):
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Payment not reflected in bank account for UTR 402837..."
              className="w-full p-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
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
