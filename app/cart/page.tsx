"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Truck, Sparkles } from "lucide-react";
import UpiPaymentCheckout from "@/components/payment/UpiPaymentCheckout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role === "admin") {
      router.push("/admin/artworks");
    }
  }, [status, session, router]);

  if (status === "loading" || !session || session.user?.role !== "customer") {
    return null;
  }

  const cartTitles = cart.map((i) => `${i.title} (x${i.quantity})`).join(", ");

  return (
    <div className="bg-[#FDFBF7] min-h-screen pt-28 pb-16 sm:py-20 px-4 sm:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        {/* Navigation / Header */}
        <div className="mb-10">
          <Link
            href="/gallery"
            className="inline-flex items-center text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-brand-burgundy mb-6 transition-all group"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200/60 pb-6 gap-3">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-brand-burgundy font-bold uppercase mb-1">
                TACHÈ Studio
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-[0.1em] uppercase text-[#2E292E]">
                Shopping Cart ({totalItems})
              </h1>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-red-600 transition-colors self-start sm:self-auto"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 sm:p-20 text-center max-w-xl mx-auto shadow-sm border border-gray-100 space-y-6">
            <div className="w-20 h-20 bg-brand-burgundy/5 text-brand-burgundy rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-wider uppercase text-[#2E292E]">
                Your Cart is Empty
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                You haven&apos;t added any artworks to your collection yet. Browse our curated gallery to discover original pieces.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-3 px-10 py-4 bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.3em] uppercase rounded-full hover:bg-[#2E292E] transition-all duration-300 shadow-xl shadow-brand-burgundy/15"
            >
              <Sparkles size={16} /> Explore Gallery
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6"
                >
                  {/* Artwork Image */}
                  <Link
                    href={`/artwork/${item.id}`}
                    className="relative w-full sm:w-28 aspect-[4/5] rounded-xl overflow-hidden shrink-0 bg-gray-100"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="120px"
                    />
                  </Link>

                  {/* Artwork Info */}
                  <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
                    <div>
                      {item.category && (
                        <span className="text-[9px] font-bold tracking-[0.2em] text-brand-burgundy uppercase">
                          {item.category}
                        </span>
                      )}
                      <h3 className="text-base font-bold tracking-wider text-[#2E292E] uppercase truncate">
                        <Link href={`/artwork/${item.id}`} className="hover:text-brand-burgundy transition-colors">
                          {item.title}
                        </Link>
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      Original Edition Artwork
                    </p>
                    <p className="text-sm font-bold text-[#2E292E]">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex sm:flex-col items-center justify-between sm:items-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50/50 px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-brand-burgundy transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-xs font-bold text-[#2E292E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-brand-burgundy transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold tracking-wide text-brand-burgundy">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50"
                        title="Remove artwork"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 text-gray-500">
                  <Truck size={20} className="text-brand-burgundy shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#2E292E]">Insured Delivery</h4>
                    <p className="text-[10px] text-gray-400">Safely packaged art shipments worldwide.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 text-gray-500">
                  <ShieldCheck size={20} className="text-brand-burgundy shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#2E292E]">Certificate of Authenticity</h4>
                    <p className="text-[10px] text-gray-400">Signed & certified by the artist.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary & Checkout Column */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 lg:sticky lg:top-28">
              <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-[#2E292E] border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-[#2E292E]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Estimated Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px]">Complimentary</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax & Insurance</span>
                  <span className="text-gray-400">Included</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <span className="text-xs font-bold tracking-widest uppercase text-[#2E292E]">Total Amount</span>
                <span className="text-2xl font-bold tracking-tight text-brand-burgundy">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-2">
                <UpiPaymentCheckout
                  amount={subtotal}
                  artworkTitle={`Cart Order (${totalItems} items): ${cartTitles}`}
                  buttonText="Proceed to UPI Payment"
                  onSuccess={clearCart}
                />
              </div>

              <p className="text-[9px] text-center text-gray-400 tracking-wider uppercase">
                Encrypted & Secure 256-Bit SSL Checkout
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
