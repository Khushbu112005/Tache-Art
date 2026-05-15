"use client";

import { useState, useEffect } from "react";

interface Payment {
  _id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  userId: { name: string; email: string } | null;
  artworkId: { title: string; price: number } | null;
  createdAt: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPayments(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusStyles: Record<string, string> = {
    created: "bg-gray-50 text-gray-700 border-gray-200",
    paid: "bg-green-50 text-green-800 border-green-200",
    failed: "bg-red-50 text-red-800 border-red-200",
    refunded: "bg-purple-50 text-purple-800 border-purple-200",
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 tracking-wider">
        LOADING...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-widest uppercase text-black mb-8">
        Payment History
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FBFBFB] text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Artwork</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-gray-500 text-sm"
                  >
                    <p className="text-lg font-bold tracking-widest uppercase mb-2">
                      No Payments Yet
                    </p>
                    <p className="text-gray-400">
                      Payments will appear here once customers make purchases via
                      Razorpay.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-gray-600">
                        {payment.orderId?.slice(-12) || "—"}
                      </p>
                      {payment.paymentId && (
                        <p className="text-[10px] font-mono text-gray-400 mt-1">
                          PID: {payment.paymentId.slice(-10)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-black">
                        {payment.userId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.userId?.email || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {payment.artworkId?.title || "Custom Order"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-black">
                        ₹{payment.amount?.toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          statusStyles[payment.status] || statusStyles.created
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
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
