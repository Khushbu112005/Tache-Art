"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface ArtworkFiltersProps {
  categories: string[];
  onFilterChange: (filters: Record<string, string>) => void;
  initialFilters?: Record<string, string>;
}

export default function ArtworkFilters({
  categories,
  onFilterChange,
  initialFilters = {},
}: ArtworkFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [category, setCategory] = useState(initialFilters.category || "");
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "newest");
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = useCallback(() => {
    const filters: Record<string, string> = {};
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (sortBy) filters.sortBy = sortBy;
    onFilterChange(filters);
  }, [search, category, sortBy, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
  }, [applyFilters]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSortBy("newest");
  };

  const hasActiveFilters = search || category || sortBy !== "newest";

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artworks..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand-burgundy bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 border rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
            showFilters
              ? "bg-[#2E292E] text-white border-[#2E292E]"
              : "bg-white text-gray-500 border-gray-200 hover:border-brand-burgundy hover:text-brand-burgundy"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-center bg-[#FBFBFB] p-6 rounded-2xl border border-gray-100 animate-[premiumFadeIn_0.3s_ease]">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-burgundy bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-burgundy bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-burgundy hover:opacity-70 transition-opacity mt-6"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
