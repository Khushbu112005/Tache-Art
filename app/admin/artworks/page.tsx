"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { ARTWORK_CATEGORIES } from "@/utils/constants";

export default function AdminArtworks() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "Canvas Painting",
        imageUrl: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            const res = await fetch("/api/artworks?limit=100");
            const data = await res.json();
            setArtworks(data.success ? data.data.artworks : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let imageUrl = formData.imageUrl;

            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append("file", imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                });
                const uploadResult = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadResult.error);
                imageUrl = uploadResult.data?.secure_url || uploadResult.secure_url;
            }

            if (!imageUrl) {
                alert("Please provide an image url or upload an image");
                setIsUploading(false);
                return;
            }

            const res = await fetch("/api/artworks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    imageUrl,
                }),
            });

            if (res.ok) {
                setIsAdding(false);
                setFormData({ title: "", description: "", price: "", category: "Canvas Painting", imageUrl: "" });
                setImageFile(null);
                fetchArtworks();
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this artwork?")) return;

        try {
            const res = await fetch(`/api/artworks/${id}`, { method: "DELETE" });
            if (res.ok) fetchArtworks();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-widest uppercase text-black">Manage Artworks</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center space-x-2 bg-black text-white px-4 py-2 text-sm font-medium tracking-wide uppercase hover:bg-[var(--tache-soft-brown)] transition-colors"
                >
                    {isAdding ? <span>Cancel</span> : <><Plus size={16} /> <span>Add Artwork</span></>}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAddSubmit} className="bg-white p-6 md:p-8 border border-[var(--tache-beige)] rounded-sm shadow-sm mb-12">
                    <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-black">Add New Piece</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[var(--tache-soft-brown)]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Price (₹)</label>
                            <input type="number" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[var(--tache-soft-brown)]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[var(--tache-soft-brown)]">
                                {ARTWORK_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Upload Image</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm mt-1" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-semibold tracking-widest text-black mb-2 uppercase">Description</label>
                        <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[var(--tache-soft-brown)]"></textarea>
                    </div>

                    <button type="submit" disabled={isUploading} className="bg-black text-white px-6 py-3 text-sm font-medium tracking-wide uppercase hover:bg-[var(--tache-soft-brown)] disabled:opacity-50">
                        {isUploading ? "Uploading..." : "Save Artwork"}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-500 tracking-wider">LOADING...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {artworks.map((art: any) => (
                        <div key={art._id} className="bg-white border border-[var(--tache-beige)] rounded-sm shadow-sm overflow-hidden flex flex-col">
                            <div className="relative aspect-[4/5] bg-gray-100">
                                <Image src={art.imageUrl} alt={art.title} fill className="object-cover" sizes="25vw" />
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-sm tracking-wide uppercase truncate pr-4 text-black">{art.title}</h3>
                                    <p className="text-sm font-semibold text-[var(--tache-soft-brown)]">₹{art.price.toLocaleString("en-IN")}</p>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">{art.category}</p>
                                <div className="mt-auto flex justify-end space-x-2 border-t border-[var(--tache-beige)] pt-4">
                                    <button onClick={() => handleDelete(art._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Artwork">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
