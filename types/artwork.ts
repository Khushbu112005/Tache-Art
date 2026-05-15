export interface IArtwork {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  tags: string[];
  priority: "featured" | "normal" | "archived";
  medium: string;
  dimensions: string;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IArtworkInput {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  tags?: string[];
  priority?: "featured" | "normal" | "archived";
  medium?: string;
  dimensions?: string;
}

export interface IArtworkFilters {
  search?: string;
  category?: string;
  medium?: string;
  minPrice?: number;
  maxPrice?: number;
  priority?: string;
  isSold?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface IArtworkSerialized {
  _id: string;
  title: string;
  imageUrl: string;
  price: number;
  description: string;
  category: string;
  tags: string[];
  priority: string;
  medium: string;
  dimensions: string;
  isSold: boolean;
}
