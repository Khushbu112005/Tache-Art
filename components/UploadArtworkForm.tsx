"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, ImagePlus } from "lucide-react";
import Image from "next/image";

export default function UploadArtworkForm({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            setError("Please select an image");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 1. Upload image
            const formData = new FormData();
            formData.append("file", imageFile);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error("Image upload failed");
            }

            const uploadData = await uploadRes.json();

            // 2. Create artwork record
            const artworkRes = await fetch("/api/artworks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price: Number(price),
                    category,
                    imageUrl: uploadData.data?.secure_url || uploadData.secure_url,
                }),
            });

            if (!artworkRes.ok) {
                throw new Error("Failed to save artwork");
            }

            onClose();
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-[var(--tache-cream)]/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--tache-beige)]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold tracking-widest uppercase">Upload Artwork</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-sm text-sm border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium tracking-wide text-gray-700 mb-2">
                            IMAGE
                        </label>
                        {imagePreview ? (
                            <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-gray-200">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[var(--tache-soft-brown)] transition-colors bg-gray-50">
                                <ImagePlus size={40} className="text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Click to upload image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                            TITLE
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Artwork title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                            DESCRIPTION
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the artwork"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)] resize-vertical"
                        />
                    </div>

                    {/* Price & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                PRICE (₹)
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                CATEGORY
                            </label>
                            <input
                                type="text"
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. Portrait"
                                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-gradient text-white py-4 text-sm font-medium tracking-widest uppercase disabled:opacity-50 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Upload size={18} />
                        {loading ? "Uploading..." : "Upload Artwork"}
                    </button>
                </form>
            </div>
        </div>
    );
}
