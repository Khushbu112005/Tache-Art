"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/context/CartContext";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export default function UserCartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems, clearCart } = useCart();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <span className="text-[9px] tracking-[0.3em] text-brand-burgundy font-bold uppercase block mb-1">
            Bag Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.1em] text-[#2E292E] uppercase font-serif">
            Shopping Cart ({totalItems})
          </h1>
        </div>

        {cart.length > 0 && (
          <Link
            href="/cart"
            className="bg-brand-burgundy hover:bg-[#2E292E] text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all shadow-sm self-start sm:self-auto flex items-center gap-2"
          >
            Checkout Bag <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Cart Contents */}
      <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-gray-100 space-y-6 sm:space-y-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#2E292E] uppercase">
              Your Shopping Bag
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
              {totalItems} {totalItems === 1 ? "Item" : "Items"} in Bag
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold uppercase tracking-widest flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2E292E] uppercase tracking-widest">
                Your bag is empty
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto uppercase tracking-wide">
                Discover hand-painted original artworks in our gallery and add them to your collection.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-block px-10 py-4 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm hover:bg-[#2E292E] transition-all shadow-md"
            >
              Explore Art Gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="bg-[#FBFBFB] p-4 sm:p-6 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#2E292E] uppercase tracking-wide truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-bold text-brand-burgundy">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-brand-burgundy"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-brand-burgundy"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Item Total & Remove */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-sm font-bold text-[#2E292E]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-rose-600 p-2"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-2xl border border-[#F4EFE6] space-y-6 h-fit">
              <h3 className="text-xs font-bold tracking-widest text-[#2E292E] uppercase">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs text-gray-600 border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2E292E]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase">Free Insured Delivery</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#2E292E] pt-2">
                <span>Total</span>
                <span className="text-brand-burgundy text-lg">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <Link
                href="/cart"
                className="block w-full py-4 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.3em] uppercase text-center rounded-sm hover:bg-[#2E292E] transition-all shadow-md"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
