"use client";

import { useState, useEffect } from "react";

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/contact");
            const data = await res.json();
            setMessages(data.success ? data.data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 tracking-wider">LOADING...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase text-black mb-8">Contact Messages</h1>

            <div className="bg-white rounded-sm shadow-sm border border-[var(--tache-beige)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[var(--tache-cream)] text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">From</th>
                                <th className="px-6 py-4 font-medium">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--tache-beige)]">
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                messages.map((msg: any) => (
                                    <tr key={msg._id} className="hover:bg-gray-50 transition-colors align-top">
                                        <td className="px-6 py-4 w-48">
                                            <p className="text-xs text-gray-600 font-medium">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 w-64">
                                            <p className="text-sm font-bold text-black">{msg.name}</p>
                                            <a href={`mailto:${msg.email}`} className="text-xs text-[var(--tache-soft-brown)] hover:underline mt-1 block font-medium">
                                                {msg.email}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
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
