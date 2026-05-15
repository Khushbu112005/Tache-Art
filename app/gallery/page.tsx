"use client";

import { useState, useEffect, useCallback } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import ArtworkFilters from "@/components/artwork/ArtworkFilters";
import AdminUploadButton from "@/components/AdminUploadButton";

interface Artwork {
  _id: string;
  title: string;
  imageUrl: string;
  price: number;
  description: string;
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtworks = useCallback(async (filters: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/artworks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setArtworks(
          data.data.artworks.map((art: Record<string, unknown>) => ({
            _id: (art._id as string).toString(),
            title: art.title as string,
            imageUrl: art.imageUrl as string,
            price: art.price as number,
            description: art.description as string,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtworks();
    // Fetch categories
    fetch("/api/artworks?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const cats = [
            ...new Set(
              data.data.artworks.map((a: Record<string, unknown>) => a.category as string)
            ),
          ] as string[];
          setCategories(cats.filter(Boolean));
        }
      })
      .catch(console.error);
  }, [fetchArtworks]);

  return (
    <div className="bg-background min-h-screen py-32 sm:py-48 px-6 sm:px-10 lg:px-20">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-20 max-w-4xl mx-auto space-y-10">
          <div className="inline-block px-5 py-1.5 glass rounded-full">
            <span className="text-[9px] font-bold tracking-[0.5em] text-brand-burgundy uppercase">
              The Archive
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter uppercase text-foreground leading-[0.9]">
            Studio <br />
            <span className="italic font-light text-brand-burgundy">Collection</span>
          </h1>
          <p className="text-xs sm:text-base text-foreground/40 font-medium tracking-[0.2em] uppercase leading-relaxed max-w-2xl">
            A definitive index of our most recent works. Each piece represents a unique
            intersection of raw emotion and disciplined craft.
          </p>
          <div className="pt-6">
            <AdminUploadButton />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <ArtworkFilters
            categories={categories}
            onFilterChange={fetchArtworks}
          />
        </div>

        {/* Grid */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-burgundy/10 to-transparent blur-3xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-1000" />

          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-6">
                  <div className="rounded-2xl bg-tache-beige overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 text-gray-500 uppercase tracking-widest text-sm">
              No artworks found matching your criteria.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {artworks.map((artwork) => (
                <div key={artwork._id} className="break-inside-avoid mb-6">
                  <ArtworkCard {...artwork} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
