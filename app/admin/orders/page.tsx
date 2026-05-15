"use client";

import { useState, useEffect } from "react";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            setOrders(data.success ? data.data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-center py-20 tracking-wider">LOADING...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase text-black mb-8">Manage Orders</h1>

            <div className="bg-white rounded-sm shadow-sm border border-[var(--tache-beige)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[var(--tache-cream)] text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4 font-medium">Order details</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Message / Reference</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--tache-beige)]">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors align-top">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-black uppercase">{order.artworkType}</p>
                                            <p className="text-xs text-gray-500 mt-1">Size: {order.size}</p>
                                            <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-black">{order.name}</p>
                                            <a href={`mailto:${order.email}`} className="text-xs text-[var(--tache-soft-brown)] hover:underline mt-1 block">
                                                {order.email}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-600 line-clamp-3 max-w-xs">{order.message}</p>
                                            {order.referenceImage && (
                                                <a href={order.referenceImage} target="_blank" rel="noreferrer" className="text-xs text-[var(--tache-soft-brown)] font-medium mt-2 inline-block hover:underline">
                                                    View Reference Image &rarr;
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border rounded-sm outline-none focus:ring-1 focus:ring-black
                          ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                                        order.status === 'in-progress' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                                            order.status === 'completed' ? 'bg-green-50 text-green-800 border-green-200' :
                                                                'bg-red-50 text-red-800 border-red-200'}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
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
