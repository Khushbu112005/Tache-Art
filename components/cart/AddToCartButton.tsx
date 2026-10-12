"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  item: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    category?: string;
  };
  quantity?: number;
  variant?: "primary" | "secondary" | "icon";
  className?: string;
}

export default function AddToCartButton({
  item,
  quantity = 1,
  variant = "primary",
  className = "",
}: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (session?.user?.role === "admin") {
    return null;
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    addToCart({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
      category: item.category,
      quantity,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#2E292E] hover:bg-brand-burgundy hover:text-white shadow-md transition-all duration-300 ${className}`}
        title="Add to Cart"
        aria-label="Add to Cart"
      >
        {added ? <Check size={16} className="text-green-600 animate-bounce" /> : <ShoppingBag size={16} />}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        onClick={handleAdd}
        className={`inline-flex items-center justify-center gap-2 border border-brand-burgundy/30 text-brand-burgundy hover:bg-brand-burgundy hover:text-white px-6 py-3.5 text-[11px] font-bold tracking-[0.3em] uppercase rounded-sm transition-all duration-300 ${className}`}
      >
        {added ? (
          <>
            <Check size={16} /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag size={16} /> Add to Cart
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full inline-flex items-center justify-center gap-3 bg-brand-burgundy text-white px-10 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#2E292E] transition-all duration-500 shadow-2xl rounded-sm ${className}`}
    >
      {added ? (
        <>
          <Check size={16} className="animate-scale" /> Added to Collection
        </>
      ) : (
        <>
          <ShoppingBag size={16} /> Add to Cart
        </>
      )}
    </button>
  );
}
