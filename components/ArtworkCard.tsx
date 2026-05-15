"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ArtworkCardProps {
    _id: string;
    title: string;
    imageUrl: string;
    price: number;
    description: string;
}

export default function ArtworkCard({ _id, title, imageUrl, price, description }: ArtworkCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const isAdmin = (session?.user as any)?.role === "admin";
    const [isHovered, setIsHovered] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this artwork? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/artworks/${_id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete artwork");
            }
        } catch (error) {
            console.error("Error deleting artwork:", error);
            alert("An error occurred while deleting the artwork");
        }
    };

    return (
        <div 
            className="group relative flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/artwork/${_id}`} className="block relative aspect-[3/4] overflow-hidden rounded-2xl bg-tache-beige">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    loading="lazy"
                    className={`object-cover transition-transform duration-1000 ease-expo ${isHovered ? "scale-105" : "scale-100"}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Overlay on hover */}
                <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 flex items-center justify-center ${isHovered ? "opacity-100" : "opacity-0"}`}>
                    <span className="px-8 py-3 bg-white text-foreground text-[10px] font-bold tracking-[0.3em] uppercase rounded-full shadow-2xl transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                        View Details
                    </span>
                </div>

                {/* Floating Tags */}
                <div className="absolute top-4 left-4 p-2">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                        <span className="text-[9px] font-bold tracking-[0.1em] text-foreground uppercase">Original</span>
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleDelete}
                        className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-brand-burgundy hover:bg-brand-burgundy hover:text-white shadow-lg transition-all duration-300 z-10"
                        title="Delete Artwork"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </Link>

            <div className="mt-6 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-base font-bold font-title tracking-tight text-foreground uppercase">{title}</h3>
                        <p className="text-[11px] text-foreground/40 uppercase tracking-widest mt-0.5">{description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold tracking-widest text-brand-burgundy">
                            ₹{price.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

