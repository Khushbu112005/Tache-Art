"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { totalItems, toggleCart, clearCart, closeCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    closeCart();
    clearCart();

    await signOut({
      redirect: false,
    });

    window.location.href = "/login";
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 sm:py-5 fixed top-0 left-0 right-0 z-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Main Navbar */}
        <div className="flex items-center h-14">

          {/* ================= LOGO ================= */}
          <Link
            href="/"
            className="group flex items-center shrink-0"
          >
            <div className="relative w-10 h-10 mr-3 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Tachè Logo"
                fill
                priority
                className="rounded-full border border-gray-100 group-hover:opacity-80 transition-opacity object-cover"
              />
            </div>

            <span className="text-xl sm:text-2xl font-bold tracking-[0.3em] text-brand-burgundy whitespace-nowrap">
              TACHÈ
            </span>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-4 xl:gap-8 whitespace-nowrap ml-6">

            {/* HOME */}
            <Link
              href="/"
              className="text-[12px] xl:text-[13px] tracking-[0.15em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300 whitespace-nowrap shrink-0 flex items-center"
            >
              HOME
            </Link>

            {/* GALLERY */}
            <Link
              href="/gallery"
              className="text-[12px] xl:text-[13px] tracking-[0.15em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300 whitespace-nowrap shrink-0 flex items-center"
            >
              GALLERY
            </Link>

            {/* CUSTOM ORDER */}
            <Link
              href="/order"
              className="text-[12px] xl:text-[13px] tracking-[0.15em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300 whitespace-nowrap shrink-0 flex items-center"
            >
              CUSTOM ORDER
            </Link>

            {/* CONTACT */}
            <Link
              href="/contact"
              className="text-[12px] xl:text-[13px] tracking-[0.15em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300 whitespace-nowrap shrink-0 flex items-center"
            >
              CONTACT
            </Link>

            {/* ADMIN */}
            {mounted && session?.user?.role === "admin" && (
              <Link
                href="/admin/artworks"
                className="text-[12px] xl:text-[13px] tracking-[0.15em] font-medium text-brand-burgundy hover:opacity-70 transition-colors uppercase whitespace-nowrap shrink-0 flex items-center"
              >
                ADMIN
              </Link>
            )}

            {/* MY DASHBOARD */}
            {mounted && session?.user?.role === "customer" && (
              <Link
                href="/user/dashboard"
                className="text-[12px] xl:text-[13px] tracking-[0.15em] font-medium text-brand-burgundy hover:opacity-70 transition-colors uppercase whitespace-nowrap shrink-0 flex items-center"
              >
                MY DASHBOARD
              </Link>
            )}

            {/* ================= CART (Only visible for customer role) ================= */}
            {mounted && session?.user?.role === "customer" && (
              <button
                onClick={toggleCart}
                className="relative text-[#2E292E] hover:text-brand-burgundy transition-colors flex items-center justify-center shrink-0 cursor-pointer p-1"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag size={20} />

                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-burgundy text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* ================= LOGIN / LOGOUT ================= */}
            {mounted && session ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-9 xl:px-11 py-3 xl:py-3.5 bg-brand-burgundy text-white text-xs xl:text-[13px] tracking-[0.25em] font-bold hover:bg-[#721717] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-full hover:shadow-[0_12px_28px_rgba(139,29,29,0.45)] cursor-pointer whitespace-nowrap shrink-0"
              >
                LOGOUT
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-9 xl:px-11 py-3 xl:py-3.5 bg-brand-burgundy text-white text-xs xl:text-[13px] tracking-[0.25em] font-bold hover:bg-[#721717] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-full hover:shadow-[0_12px_28px_rgba(139,29,29,0.45)] whitespace-nowrap shrink-0"
              >
                LOGIN
              </Link>
            )}
          </div>

          {/* ================= MOBILE CART + MENU ================= */}
          <div className="lg:hidden flex items-center gap-2 ml-auto">

            {/* MOBILE CART (Only visible for customer role) */}
            {mounted && session?.user?.role === "customer" && (
              <button
                onClick={toggleCart}
                className="relative p-2 text-brand-burgundy cursor-pointer"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag size={22} />

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-burgundy text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* MOBILE MENU */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-burgundy focus:outline-none p-2 cursor-pointer"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE NAV ================= */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-gray-50 h-[calc(100vh-80px)]">

          <div className="px-6 py-12 flex flex-col items-center justify-center space-y-8 h-full">

            {/* HOME */}
            <Link
              href="/"
              className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
              onClick={() => setIsOpen(false)}
            >
              HOME
            </Link>

            {/* GALLERY */}
            <Link
              href="/gallery"
              className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
              onClick={() => setIsOpen(false)}
            >
              GALLERY
            </Link>

            {/* CUSTOM ORDER */}
            <Link
              href="/order"
              className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
              onClick={() => setIsOpen(false)}
            >
              CUSTOM ORDER
            </Link>

            {/* CONTACT */}
            <Link
              href="/contact"
              className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
              onClick={() => setIsOpen(false)}
            >
              CONTACT US
            </Link>

            {/* DIVIDER */}
            <div className="w-12 h-px bg-brand-burgundy/10 mb-4" />

            {/* ================= AUTH ================= */}
            {mounted &&
              (session ? (
                <div className="flex flex-col items-center space-y-8">

                  {/* ADMIN */}
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin/artworks"
                      className="text-lg font-bold tracking-[0.2em] text-brand-burgundy"
                      onClick={() => setIsOpen(false)}
                    >
                      ADMIN PANEL
                    </Link>
                  )}

                  {/* CUSTOMER */}
                  {session.user?.role === "customer" && (
                    <Link
                      href="/user/dashboard"
                      className="text-lg font-bold tracking-[0.2em] text-brand-burgundy"
                      onClick={() => setIsOpen(false)}
                    >
                      MY DASHBOARD
                    </Link>
                  )}

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="px-10 py-3 border border-gray-200 text-sm font-bold tracking-[0.3em] text-gray-400 rounded-full cursor-pointer"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-12 py-4 bg-brand-burgundy text-white text-sm tracking-[0.3em] font-bold rounded-full shadow-lg shadow-brand-burgundy/20 mt-4"
                  onClick={() => setIsOpen(false)}
                >
                  LOGIN
                </Link>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

