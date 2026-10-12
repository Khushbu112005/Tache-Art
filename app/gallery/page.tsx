"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const PAGE_SIZE = 9;

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="break-inside-avoid mb-6">
      <div className="rounded-2xl bg-[#F9F8F6] overflow-hidden">
        <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const serialize = (art: Record<string, unknown>): Artwork => ({
    _id: (art._id as string).toString(),
    title: art.title as string,
    imageUrl: art.imageUrl as string,
    price: art.price as number,
    description: art.description as string,
  });

  // Fetch a specific page, optionally appending to existing list
  const fetchPage = useCallback(
    async (pageNum: number, activeFilters: Record<string, string>, append: boolean) => {
      try {
        const params = new URLSearchParams({
          ...activeFilters,
          page: String(pageNum),
          limit: String(PAGE_SIZE),
        });
        const res = await fetch(`/api/artworks?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          const newItems = data.data.artworks.map(serialize);
          setArtworks((prev) => (append ? [...prev, ...newItems] : newItems));
          setTotalPages(data.data.pagination?.totalPages ?? 1);
        }
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
      }
    },
    []
  );

  // Initial load / filter change — reset to page 1
  const handleFilterChange = useCallback(
    async (newFilters: Record<string, string>) => {
      setFilters(newFilters);
      setPage(1);
      setInitialLoading(true);
      await fetchPage(1, newFilters, false);
      setInitialLoading(false);
    },
    [fetchPage]
  );

  // First mount
  useEffect(() => {
    handleFilterChange({});
    // Fetch categories separately
    fetch("/api/artworks?limit=100")
      .then((r) => r.json())
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll — IntersectionObserver watches a sentinel div at the bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loadingMore && !initialLoading && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          setLoadingMore(true);
          await fetchPage(nextPage, filters, true);
          setLoadingMore(false);
        }
      },
      { rootMargin: "300px" } // trigger 300px before reaching bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, initialLoading, filters, fetchPage]);

  return (
    <div className="bg-background min-h-screen pt-24 sm:pt-36 pb-20 sm:pb-32 px-4 sm:px-10 lg:px-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-20 max-w-4xl mx-auto space-y-6 sm:space-y-10">
          <div className="inline-block px-5 py-1.5 glass rounded-full">
            <span className="text-[9px] font-bold tracking-[0.5em] text-brand-burgundy uppercase">
              The Archive
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter uppercase text-foreground leading-[0.95] sm:leading-[0.9]">
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
          <ArtworkFilters categories={categories} onFilterChange={handleFilterChange} />
        </div>

        {/* Grid */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-burgundy/10 to-transparent blur-3xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-1000" />

          {initialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 text-gray-500 uppercase tracking-widest text-sm">
              No artworks found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <div key={artwork._id}>
                  <ArtworkCard {...artwork} />
                </div>
              ))}

              {/* Skeleton cards shown while loading more */}
              {loadingMore &&
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
            </div>
          )}

          {/* Sentinel — triggers next page load when visible */}
          <div ref={sentinelRef} className="h-1" />

          {/* End of results message */}
          {!initialLoading && !loadingMore && page >= totalPages && artworks.length > 0 && (
            <p className="text-center text-[10px] tracking-[0.4em] text-gray-300 uppercase mt-16 pb-4">
              — End of Collection —
            </p>
          )}

          {/* Loading spinner */}
          {loadingMore && (
            <div className="flex justify-center mt-10">
              <div className="w-6 h-6 border-2 border-brand-burgundy/30 border-t-brand-burgundy rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
