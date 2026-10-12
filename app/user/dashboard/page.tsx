"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Package,
  Palette,
  CreditCard,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface Order {
  _id: string;
  artworkType: string;
  size: string;
  status: string;
  priority: string;
  message: string;
  createdAt: string;
}

interface PaymentRecord {
  _id: string;
  amount: number;
  status: string;
}

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const { subtotal, totalItems } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true);
      Promise.all([
        fetch("/api/orders?user=true").then((res) => res.json()),
        fetch("/api/payments?user=true").then((res) => res.json()),
      ])
        .then(([ordersData, paymentsData]) => {
          if (ordersData.success) {
            setOrders(ordersData.data || []);
          }
          if (paymentsData.success) {
            setPayments(paymentsData.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const totalSpent = payments
    .filter((p) => p.status === "paid")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    payment_pending_verification: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-burgundy/10 rounded-full border border-brand-burgundy/20 mb-2">
            <ShieldCheck size={12} className="text-brand-burgundy" />
            <span className="text-[9px] tracking-[0.3em] text-brand-burgundy font-bold uppercase">
              Collector Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.1em] text-[#2E292E] uppercase font-serif">
            Welcome, {session?.user?.name || "Collector"}
          </h1>
        </div>

        <Link
          href="/order"
          className="bg-[#2E292E] hover:bg-brand-burgundy text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all shadow-sm self-start sm:self-auto"
        >
          + New Custom Request
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Cart */}
        <Link
          href="/user/cart"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all duration-300 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-burgundy/10 text-brand-burgundy flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-burgundy flex items-center gap-1 transition-colors">
              View <ArrowRight size={12} />
            </span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Cart Items</p>
          <h3 className="text-3xl font-bold text-[#2E292E] mt-1">{totalItems}</h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">₹{subtotal.toLocaleString("en-IN")} Subtotal</p>
        </Link>

        {/* Total Orders */}
        <Link
          href="/user/orders"
          className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all duration-300 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-sky-700 flex items-center gap-1 transition-colors">
              View <ArrowRight size={12} />
            </span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Total Orders</p>
          <h3 className="text-3xl font-bold text-[#2E292E] mt-1">{orders.length}</h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">Acquired Works</p>
        </Link>

        {/* Custom Requests */}
        <Link
          href="/user/requests"
          className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all duration-300 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-purple-700 flex items-center gap-1 transition-colors">
              View <ArrowRight size={12} />
            </span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Custom Requests</p>
          <h3 className="text-3xl font-bold text-[#2E292E] mt-1">{orders.length}</h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">Commissions Submitted</p>
        </Link>

        {/* Total Payments */}
        <Link
          href="/user/payments"
          className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/30 transition-all duration-300 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View <ArrowRight size={12} />
            </span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Total Payments</p>
          <h3 className="text-3xl font-bold text-[#2E292E] mt-1">₹{totalSpent.toLocaleString("en-IN")}</h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">{payments.length} Transactions</p>
        </Link>
      </div>

      {/* Profile & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Account Card */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
          <h3 className="text-xs font-bold tracking-widest text-[#2E292E] uppercase">
            Collector Profile
          </h3>
          <div className="space-y-4 text-xs font-medium text-gray-600">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400">Email</span>
              <span className="font-semibold text-gray-800">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400">Status</span>
              <span className="text-brand-burgundy font-bold uppercase">Verified Collector</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400">Active Commissions</span>
              <span>{orders.filter((o) => o.status !== "completed").length} Active</span>
            </div>
          </div>
          <Link
            href="/order"
            className="block w-full py-3.5 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.25em] uppercase text-center rounded-sm hover:bg-[#2E292E] transition-all shadow-sm"
          >
            Commission Custom Artwork
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold tracking-widest text-[#2E292E] uppercase">
              Recent Artwork Activity
            </h3>
            <Link
              href="/user/orders"
              className="text-[10px] font-bold tracking-widest text-brand-burgundy uppercase hover:opacity-70"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <Sparkles size={32} className="mx-auto text-gray-300" />
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                No artwork activity yet.
              </p>
              <Link
                href="/gallery"
                className="inline-block px-8 py-3 bg-[#2E292E] text-white text-[10px] font-bold tracking-[0.25em] uppercase rounded-sm"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order._id}
                  className="p-4 bg-[#FBFBFB] rounded-xl border border-gray-100 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2E292E] uppercase tracking-wide truncate">
                      {order.artworkType}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      Size: {order.size} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                      statusColors[order.status] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {order.status === "payment_pending_verification"
                      ? "Payment Pending"
                      : order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
