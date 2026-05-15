"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Order {
  _id: string;
  artworkType: string;
  size: string;
  status: string;
  priority: string;
  message: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/orders?user=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="bg-white min-h-screen py-24 sm:py-32 px-6 sm:px-10 flex items-center justify-center">
        <div className="text-gray-400 tracking-widest uppercase text-sm">Loading...</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    "in-progress": "bg-blue-50 text-blue-800 border-blue-200",
    completed: "bg-green-50 text-green-800 border-green-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className="bg-white min-h-screen py-24 sm:py-32 px-6 sm:px-10">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-16 space-y-4">
          <p className="text-[10px] tracking-[0.4em] text-brand-burgundy font-bold uppercase">
            Buyer Registry
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-[0.1em] text-[#2E292E] uppercase">
            Welcome, {session?.user?.name || "Collector"}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* User Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-[#FBFBFB] p-8 rounded-2xl border border-gray-100">
              <h3 className="text-xs font-bold tracking-widest text-black uppercase mb-6">
                Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {session?.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-sm font-medium text-brand-burgundy uppercase tracking-widest">
                    Verified Collector
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                    Total Orders
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#FBFBFB] p-6 rounded-2xl border border-gray-100 animate-pulse">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#FBFBFB] p-12 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl opacity-20">🎨</span>
                </div>
                <h3 className="text-lg font-bold tracking-widest text-[#2E292E] uppercase mb-4">
                  No Orders Yet
                </h3>
                <p className="text-sm text-gray-400 tracking-wide mb-8 max-w-sm">
                  You haven&apos;t purchased any masterpieces yet. Explore the gallery to find your
                  next centerpiece.
                </p>
                <Link
                  href="/gallery"
                  className="px-10 py-4 bg-[#2E292E] text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-brand-burgundy transition-all duration-500 rounded-full"
                >
                  Explore Gallery
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-black uppercase mb-4">
                  Your Orders
                </h3>
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-[#FBFBFB] p-6 rounded-2xl border border-gray-100 hover:border-brand-burgundy/20 transition-colors"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#2E292E] uppercase tracking-wide">
                          {order.artworkType}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Size: {order.size}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-xs">
                          {order.message}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            statusColors[order.status] || "bg-gray-50 text-gray-800 border-gray-200"
                          }`}
                        >
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
