"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload } from "lucide-react";
import { Suspense } from 'react';

function OrderFormComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refArtTitle = searchParams?.get("title") || "";

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        artworkType: refArtTitle ? "Existing Artwork" : "Custom Request",
        size: "Standard (24x36)",
        message: refArtTitle ? `I would like to inquire about "${refArtTitle}".` : "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let imageUrl = "";

            if (imageFile) {
                const formDataUpload = new FormData();
                formDataUpload.append("file", imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                if (!uploadRes.ok) throw new Error("Image upload failed");

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.data?.secure_url || uploadData.secure_url;
            }

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    referenceImage: imageUrl || undefined,
                }),
            });

            if (!res.ok) throw new Error("Could not submit order");

            setSuccess(true);
            window.scrollTo(0, 0);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-20 bg-white border border-[var(--tache-beige)] rounded-sm p-8 shadow-sm">
                <h2 className="text-2xl font-bold tracking-widest uppercase mb-4 text-black">Request Received</h2>
                <p className="text-gray-600 font-light mb-8 max-w-md mx-auto">
                    Thank you for your interest in TACHÈ. We have received your request and will get back to you within 24-48 hours with a quote and next steps.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="border-b border-black text-black pb-1 text-sm font-medium tracking-widest uppercase hover:text-[var(--tache-soft-brown)] hover:border-[var(--tache-soft-brown)] transition-colors"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-[var(--tache-cream)]/50 p-8 md:p-12 border border-[var(--tache-beige)]/50 rounded-xl shadow-lg">
            {error && (
                <div className="bg-red-50 text-red-500 p-4 mb-6 rounded-sm text-sm border border-red-100 text-center uppercase tracking-wide">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)] bg-[var(--tache-cream)]"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)] bg-[var(--tache-cream)]"
                            placeholder="Your Email"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Artwork Type</label>
                        <select
                            value={formData.artworkType}
                            onChange={(e) => setFormData({ ...formData, artworkType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)] bg-[var(--tache-cream)]"
                        >
                            <option value="Custom Request">Custom Request</option>
                            <option value="Existing Artwork">Inquire about existing artwork</option>
                            <option value="Custom Portrait">Custom Portrait</option>
                            <option value="Abstract Piece">Custom Abstract Piece</option>
                            <option value="Other">Other Custom Request</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Preferred Size</label>
                        <select
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)] bg-[var(--tache-cream)]"
                        >
                            <option value="Small (18x24)">Small (18x24")</option>
                            <option value="Medium (24x36)">Medium (24x36")</option>
                            <option value="Large (36x48)">Large (36x48")</option>
                            <option value="Extra Large (48x60)">Extra Large (48x60")</option>
                            <option value="Custom">Custom Size</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Message / Vision</label>
                    <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)] bg-[var(--tache-cream)] resize-none"
                        placeholder="Tell me about what you are looking for..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Reference Image (Optional)</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-sm cursor-pointer hover:bg-gray-50 transition-colors bg-[var(--tache-cream)]">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 font-light">
                                    {imageFile ? imageFile.name : <span className="font-semibold">Click to upload</span>}
                                </p>
                                {!imageFile && <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>}
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-fit px-16 py-4 mt-8 bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#2E292E] transition-all duration-700 shadow-xl shadow-brand-burgundy/20 rounded-full disabled:opacity-50"
                    >
                        {loading ? "Submitting Request..." : "Submit Order Request"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function OrderForm() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading form...</div>}>
            <OrderFormComponent />
        </Suspense>
    )
}

