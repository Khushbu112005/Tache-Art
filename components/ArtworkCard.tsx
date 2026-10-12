"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";

interface ArtworkCardProps {
  _id: string;
  title: string;
  imageUrl: string;
  price: number;
  description: string;
}

export default function ArtworkCard({
  _id,
  title,
  imageUrl,
  price,
  description,
}: ArtworkCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this artwork? This action cannot be undone.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/artworks/${_id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error || "Failed to delete artwork");
      }
    } catch {
      alert("An error occurred while deleting the artwork");
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Eye option on top-left to navigate to artwork detail page (mobile & tablet only) */}
      <Link
        href={`/artwork/${_id}`}
        className="lg:hidden absolute top-3 left-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#2E292E] hover:bg-brand-burgundy hover:text-white shadow-md transition-all duration-300"
        title="View Details"
        aria-label="View Details"
      >
        <Eye size={16} />
      </Link>

      {/* Cart button on top-right (& Admin Delete if applicable) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full text-brand-burgundy hover:bg-brand-burgundy hover:text-white shadow-md transition-all duration-300"
            title="Delete Artwork"
            aria-label="Delete Artwork"
          >
            <Trash2 size={14} />
          </button>
        )}
        <AddToCartButton
          item={{
            id: _id,
            title,
            imageUrl,
            price,
          }}
          variant="icon"
        />
      </div>

      <Link href={`/artwork/${_id}`} className="block">
        <div
          className="relative aspect-[9/10] rounded-2xl overflow-hidden"
          style={{
            boxShadow: isHovered
              ? "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)"
              : "0 4px 20px rgba(0,0,0,0.08)",
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            transition: "box-shadow 0.4s ease, transform 0.4s ease",
          }}
        >
          {/* Artwork image — covers full card */}
          <Image
            src={imageUrl}
            alt={title}
            fill
            loading="lazy"
            className={`object-cover transition-transform duration-700 ${isHovered ? "scale-[1.07]" : "scale-100"}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Title & price overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
            <div className="flex justify-between items-end gap-2">
              <div className="min-w-0">
                <h3 className="text-white text-[12px] font-bold tracking-[0.15em] uppercase truncate drop-shadow">
                  {title}
                </h3>
                <p className="text-white/60 text-[10px] tracking-widest truncate mt-0.5">
                  {description}
                </p>
              </div>
              <span className="text-white text-[13px] font-bold tracking-wider shrink-0 drop-shadow">
                ₹{price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* View Details center overlay (desktop hover only) */}
          <div
            className={`hidden lg:flex absolute inset-0 items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <span className="px-6 py-2.5 bg-white/95 text-brand-burgundy text-[10px] font-bold tracking-[0.35em] uppercase rounded-full shadow-xl">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
