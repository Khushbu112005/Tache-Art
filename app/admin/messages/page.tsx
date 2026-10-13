"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Mail,
  Send,
  ExternalLink,
  MessageSquare,
  Palette,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  X,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ContactMessage {
  _id: string;
  createdAt: string;
  name: string;
  email: string;
  message: string;
  source?: "contact" | "custom_request";
  artworkType?: string;
  size?: string;
  referenceImage?: string;
  orderId?: string;
  isRead?: boolean;
  repliedAt?: string;
  repliedSubject?: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "custom_request" | "contact" | "unread">("all");

  // Mail Modal State
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage[] | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyStatus, setReplyStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Reference Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contact");
      const data = await res.json();
      setMessages(data.success ? data.data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !currentRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, isRead: !currentRead } : m))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const openReplyModal = (msg: ContactMessage) => {
    setReplyTo(msg.email);
    const isCustom = msg.source === "custom_request";
    const defaultSubject = isCustom
      ? `Regarding your Custom Request (${msg.artworkType || "Artwork"}) — TACHÈ Art Studio`
      : `Re: Your Inquiry with TACHÈ Art Studio`;

    setReplySubject(defaultSubject);
    setReplyBody(
      `Dear ${msg.name},\n\nThank you for reaching out to TACHÈ Art Studio! We received your ${
        isCustom ? "custom artwork request" : "message"
      }.\n\n\n\nWarm regards,\nTACHÈ Art Studio Team`
    );
    setSelectedMessage([msg]);
    setReplyStatus(null);
    setReplyModalOpen(true);
  };

  const applyTemplate = (type: "quote" | "details" | "update") => {
    if (!selectedMessage || selectedMessage.length === 0) return;
    const msg = selectedMessage[0];

    if (type === "quote") {
      setReplySubject(`Custom Artwork Quote & Next Steps — TACHÈ Art Studio`);
      setReplyBody(
        `Dear ${msg.name},\n\nThank you for sharing your vision with TACHÈ Art Studio!\n\nBased on your requested artwork (${msg.artworkType || "Custom Art"}) and size (${msg.size || "Standard"}), our estimated quote is ₹[Amount].\n\nThis includes:\n- Premium stretched canvas & high-grade archival pigments\n- Progress updates & digital preview before shipping\n- Protective museum-grade varnish\n\nPlease let us know if you would like to proceed so we can reserve your commission slot.\n\nWarm regards,\nTACHÈ Art Studio`
      );
    } else if (type === "details") {
      setReplySubject(`Information needed for your Custom Request — TACHÈ Art Studio`);
      setReplyBody(
        `Dear ${msg.name},\n\nThank you for reaching out to TACHÈ Art Studio!\n\nTo ensure we bring your exact aesthetic vision to life, could you please provide a few additional details?\n1. Color palette or mood preference\n2. Wall space or lighting environment\n3. Any specific deadline or occasion\n\nLooking forward to hearing from you!\n\nWarm regards,\nTACHÈ Art Studio`
      );
    } else if (type === "update") {
      setReplySubject(`Update regarding your inquiry — TACHÈ Art Studio`);
      setReplyBody(
        `Dear ${msg.name},\n\nWe wanted to follow up on your recent message regarding "${msg.message.slice(0, 40)}...".\n\nEverything is looking wonderful, and we would love to connect further.\n\nPlease feel free to reply directly to this email.\n\nWarm regards,\nTACHÈ Art Studio`
      );
    }
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyLoading(true);
    setReplyStatus(null);

    const activeMsg = selectedMessage?.[0];

    try {
      const res = await fetch("/api/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: replyTo,
          subject: replySubject,
          message: replyBody,
          messageId: activeMsg?._id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReplyStatus({
          type: "success",
          message: `Email successfully sent to ${replyTo}!`,
        });

        // Mark as replied locally
        if (activeMsg) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === activeMsg._id
                ? {
                    ...m,
                    isRead: true,
                    repliedAt: new Date().toISOString(),
                    repliedSubject: replySubject,
                  }
                : m
            )
          );
        }

        setTimeout(() => {
          setReplyModalOpen(false);
          setReplyStatus(null);
        }, 1500);
      } else {
        setReplyStatus({
          type: "error",
          message:
            data.message ||
            "Unable to send via SMTP. You can use the 'Open in Mail App' button below.",
        });
      }
    } catch {
      setReplyStatus({
        type: "error",
        message: "Failed to connect to email server. You can use 'Open in Mail App' instead.",
      });
    } finally {
      setReplyLoading(false);
    }
  };

  const getMailtoUrl = (email: string, subject: string, body: string) => {
    return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Tab filter
      if (activeTab === "custom_request" && msg.source !== "custom_request") return false;
      if (activeTab === "contact" && msg.source === "custom_request") return false;
      if (activeTab === "unread" && msg.isRead) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = msg.name?.toLowerCase().includes(q);
        const matchesEmail = msg.email?.toLowerCase().includes(q);
        const matchesMsg = msg.message?.toLowerCase().includes(q);
        const matchesArtwork = msg.artworkType?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesMsg || matchesArtwork;
      }

      return true;
    });
  }, [messages, activeTab, searchQuery]);

  const customRequestsCount = messages.filter((m) => m.source === "custom_request").length;
  const contactCount = messages.filter((m) => m.source !== "custom_request").length;
  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-[var(--tache-soft-brown)] mb-3" size={28} />
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Loading inquiries & messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-black">
            Inquiries & Messages
          </h1>
          <p className="text-xs tracking-wider text-gray-500 mt-1">
            Review custom artwork requests, contact inquiries, and email clients directly.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-sm text-xs font-semibold tracking-widest uppercase hover:bg-gray-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === "all"
                ? "bg-black text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("custom_request")}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-1.5 ${
              activeTab === "custom_request"
                ? "bg-[#8B1D1D] text-white shadow-sm"
                : "bg-[#fbeaea] text-[#8B1D1D] hover:bg-[#f6d7d7]"
            }`}
          >
            <Palette size={13} />
            <span>Custom Requests ({customRequestsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-1.5 ${
              activeTab === "contact"
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MessageSquare size={13} />
            <span>Contact Form ({contactCount})</span>
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === "unread"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, email, or message..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Messages List / Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--tache-beige)] overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-20 px-4">
            <MessageSquare size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-700">No Messages Found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No messages matched "${searchQuery}". Try clearing your search.`
                : "No customer messages or custom requests have been received yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[var(--tache-cream)] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[var(--tache-beige)]">
                  <th className="px-5 py-4 font-semibold">Type & Date</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Specifications & Vision</th>
                  <th className="px-5 py-4 font-semibold text-right">Mail & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--tache-beige)]">
                {filteredMessages.map((msg) => {
                  const isCustom = msg.source === "custom_request";
                  return (
                    <tr
                      key={msg._id}
                      className={`hover:bg-gray-50/70 transition-colors align-top ${
                        !msg.isRead ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Date & Type */}
                      <td className="px-5 py-4 w-52">
                        <div className="flex flex-col space-y-1.5">
                          {isCustom ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#8B1D1D]/10 text-[#8B1D1D] border border-[#8B1D1D]/20 w-fit">
                              <Palette size={11} />
                              <span>Custom Request</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-700 border border-gray-200 w-fit">
                              <MessageSquare size={11} />
                              <span>Contact Inquiry</span>
                            </span>
                          )}

                          <div className="text-[11px] text-gray-500 flex items-center space-x-1 pt-1">
                            <Clock size={12} className="text-gray-400" />
                            <span>
                              {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-gray-400">&bull;</span>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {msg.repliedAt && (
                            <span className="inline-flex items-center space-x-1 text-[10px] text-green-700 font-semibold pt-0.5">
                              <CheckCircle2 size={12} />
                              <span>Replied via Email</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4 w-60">
                        <p className="text-sm font-bold text-gray-900">{msg.name}</p>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-xs text-[var(--tache-soft-brown)] hover:underline block font-medium mt-0.5 break-all"
                        >
                          {msg.email}
                        </a>
                        {msg.orderId && (
                          <p className="text-[10px] text-gray-400 tracking-wider uppercase mt-1">
                            Ref Order: #{msg.orderId.toString().slice(-6).toUpperCase()}
                          </p>
                        )}
                      </td>

                      {/* Specs & Message */}
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          {isCustom && (
                            <div className="flex flex-wrap items-center gap-2">
                              {msg.artworkType && (
                                <span className="text-[11px] font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                  Type: {msg.artworkType}
                                </span>
                              )}
                              {msg.size && (
                                <span className="text-[11px] font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                  Size: {msg.size}
                                </span>
                              )}
                              {msg.referenceImage && (
                                <button
                                  onClick={() => setPreviewImage(msg.referenceImage!)}
                                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#8B1D1D] hover:underline bg-[#fbf3f3] px-2 py-0.5 rounded border border-[#8B1D1D]/20"
                                >
                                  <Eye size={12} />
                                  <span>View Reference Image</span>
                                </button>
                              )}
                            </div>
                          )}

                          <div className="bg-gray-50/80 p-3 rounded border border-gray-100 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 w-60 text-right">
                        <div className="flex flex-col items-end space-y-2">
                          {/* Primary Send Email Button */}
                          <button
                            onClick={() => openReplyModal(msg)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#8B1D1D] hover:bg-[#721717] text-white rounded text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
                          >
                            <Mail size={13} />
                            <span>Mail Customer</span>
                          </button>

                          {/* Secondary Quick Native Mailto Link */}
                          <a
                            href={getMailtoUrl(
                              msg.email,
                              `Regarding your inquiry — TACHÈ Art Studio`,
                              `Hi ${msg.name},\n\nRegarding your request:\n"${msg.message}"\n\n`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] text-gray-600 hover:text-black hover:underline"
                          >
                            <ExternalLink size={11} />
                            <span>Open Mail App</span>
                          </a>

                          <div className="flex items-center space-x-3 pt-1">
                            <button
                              onClick={() => handleToggleRead(msg._id, !!msg.isRead)}
                              className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                              title={msg.isRead ? "Mark as unread" : "Mark as read"}
                            >
                              {msg.isRead ? "Mark Unread" : "Mark Read"}
                            </button>
                            <span className="text-gray-300">&bull;</span>
                            <button
                              onClick={() => handleDelete(msg._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── EMAIL REPLY MODAL ─── */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#8B1D1D]/10 flex items-center justify-center text-[#8B1D1D]">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-wide">
                    Email Customer
                  </h3>
                  <p className="text-xs text-gray-500">
                    Send a direct reply or official quote from TACHÈ Art Studio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Templates Bar */}
            <div className="px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                <Sparkles size={13} className="text-[#8B1D1D]" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Quick Templates:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate("quote")}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[11px] font-medium text-gray-700 transition-colors"
                >
                  🎨 Price Quote & Next Steps
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("details")}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[11px] font-medium text-gray-700 transition-colors"
                >
                  📝 Ask for More Details
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("update")}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[11px] font-medium text-gray-700 transition-colors"
                >
                  ✨ Follow Up / Status
                </button>
              </div>
            </div>

            {/* Status alerts */}
            {replyStatus && (
              <div
                className={`mx-6 mt-4 p-3 rounded text-xs flex items-start space-x-2 ${
                  replyStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {replyStatus.type === "success" ? (
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{replyStatus.message}</p>
                  {replyStatus.type === "error" && (
                    <a
                      href={getMailtoUrl(replyTo, replySubject, replyBody)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 mt-2 font-bold underline text-amber-900"
                    >
                      <ExternalLink size={12} />
                      <span>Click here to open in your Mail App instead</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={sendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Recipient (To)
                </label>
                <input
                  type="email"
                  required
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Message Body
                </label>
                <textarea
                  required
                  rows={9}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-black leading-relaxed font-sans"
                />
              </div>

              {/* Original Customer Message Quote Preview */}
              {selectedMessage?.[0] && (
                <div className="p-3 bg-gray-50 border-l-2 border-[#8B1D1D] rounded-r text-[11px] text-gray-600">
                  <span className="font-bold text-gray-800">Original Inquiry from {selectedMessage[0].name}:</span>
                  <p className="mt-1 italic line-clamp-3">&ldquo;{selectedMessage[0].message}&rdquo;</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <a
                  href={getMailtoUrl(replyTo, replySubject, replyBody)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-gray-600 hover:text-black font-medium order-2 sm:order-1"
                >
                  <ExternalLink size={13} />
                  <span>Open directly in Gmail / Native Mail</span>
                </a>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#8B1D1D] hover:bg-[#721717] disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    {replyLoading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REFERENCE IMAGE MODAL PREVIEW ─── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white rounded-lg p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"
            >
              <X size={18} />
            </button>
            <div className="relative h-[500px] w-full">
              <Image
                src={previewImage}
                alt="Custom Request Reference"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 text-center">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--tache-soft-brown)] hover:underline inline-flex items-center space-x-1 font-semibold"
              >
                <ExternalLink size={12} />
                <span>Open full original image in new tab</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
