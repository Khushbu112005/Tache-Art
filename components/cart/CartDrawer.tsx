"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

import { useSession } from "next-auth/react";

export default function CartDrawer() {
  const { data: session } = useSession();
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen || session?.user?.role !== "customer") return null;


  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-100">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-burgundy/5 text-brand-burgundy rounded-full">
                <ShoppingBag size={18} />
              </div>
              <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#2E292E]">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-brand-burgundy transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-6">
                <div className="w-20 h-20 bg-[#F9F7F5] rounded-full flex items-center justify-center text-gray-300">
                  <ShoppingBag size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold tracking-wider uppercase text-[#2E292E]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-gray-400 max-w-[240px]">
                    Discover single edition artworks and custom pieces in our gallery.
                  </p>
                </div>
                <Link
                  href="/gallery"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-full hover:bg-[#2E292E] transition-all duration-300 shadow-lg shadow-brand-burgundy/10"
                >
                  Explore Gallery <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-[#FDFBF7]/50 hover:bg-[#FDFBF7] transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold tracking-wider text-[#2E292E] uppercase truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {item.category && (
                        <p className="text-[9px] font-bold tracking-[0.2em] text-brand-burgundy uppercase mt-0.5">
                          {item.category}
                        </p>
                      )}
                      <p className="text-xs font-bold text-[#2E292E] mt-1">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-gray-200 rounded-full bg-white px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-brand-burgundy transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#2E292E]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-brand-burgundy transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-bold tracking-wide text-brand-burgundy">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold text-[#2E292E] text-sm">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>Taxes & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full py-4 text-center bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.3em] uppercase rounded-full hover:bg-[#2E292E] transition-all duration-300 shadow-xl shadow-brand-burgundy/15"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full py-2.5 text-center text-gray-400 hover:text-brand-burgundy text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
