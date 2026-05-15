"use client";

import { useState, useEffect } from "react";
import { Users, Image as ImageIcon, ShoppingBag, DollarSign } from "lucide-react";

interface DashboardStats {
  artworks: { total: number; featured: number; sold: number };
  orders: { total: number; pending: number; inProgress: number; completed: number; cancelled: number };
  users: { total: number; customers: number };
  revenue: { totalRevenue: number; monthlyRevenue: { _id: { year: number; month: number }; total: number; count: number }[] };
  recentOrders: Record<string, unknown>[];
  monthlyStats: { _id: { year: number; month: number }; count: number; revenue: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-widest uppercase text-black mb-8">
          Dashboard Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    "in-progress": "bg-blue-50 text-blue-800 border-blue-200",
    completed: "bg-green-50 text-green-800 border-green-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-widest uppercase text-black mb-8">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-brand-burgundy/5 rounded-xl text-brand-burgundy">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Artworks</p>
            <p className="text-2xl font-bold text-black">{stats.artworks.total}</p>
            <p className="text-[10px] text-gray-400 mt-1">{stats.artworks.sold} sold · {stats.artworks.featured} featured</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Orders</p>
            <p className="text-2xl font-bold text-black">{stats.orders.total}</p>
            <p className="text-[10px] text-gray-400 mt-1">{stats.orders.pending} pending · {stats.orders.inProgress} active</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Customers</p>
            <p className="text-2xl font-bold text-black">{stats.users.customers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Revenue</p>
            <p className="text-2xl font-bold text-black">₹{stats.revenue.totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold tracking-widest uppercase text-black mb-6">Order Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: "Pending", value: stats.orders.pending, color: "bg-yellow-400" },
              { label: "In Progress", value: stats.orders.inProgress, color: "bg-blue-400" },
              { label: "Completed", value: stats.orders.completed, color: "bg-green-400" },
              { label: "Cancelled", value: stats.orders.cancelled, color: "bg-red-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold tracking-widest uppercase text-black mb-6">Monthly Trends</h2>
          {stats.monthlyStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.monthlyStats.map((month) => {
                const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
                const maxCount = Math.max(...stats.monthlyStats.map((m) => m.count));
                const width = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                return (
                  <div key={`${month._id.year}-${month._id.month}`} className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-20 text-right">{monthName}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-brand-burgundy h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${Math.max(width, 10)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{month.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold tracking-widest uppercase text-black">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FBFBFB] text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order: Record<string, unknown>) => (
                  <tr key={(order._id as string)?.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-black">{order.name as string}</p>
                      <p className="text-xs text-gray-500">{order.email as string}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.artworkType as string}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          statusColors[order.status as string] || "bg-gray-50 text-gray-800 border-gray-200"
                        }`}
                      >
                        {order.status as string}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt as string).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
