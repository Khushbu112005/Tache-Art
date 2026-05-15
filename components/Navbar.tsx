"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 sm:py-5 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center">
                        <div className="relative w-10 h-10 mr-3">
                            <Image
                                src="/logo.jpg"
                                alt="Tachè Logo"
                                fill
                                priority
                                className="rounded-full border border-gray-100 group-hover:opacity-80 transition-opacity object-cover"
                            />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold tracking-[0.3em] text-brand-burgundy">
                            TACHÈ
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-10">
                        <Link href="/" className="text-[13px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300">
                            HOME
                        </Link>
                        <Link href="/gallery" className="text-[13px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300">
                            GALLERY
                        </Link>
                        <Link href="/order" className="text-[13px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300">
                            CUSTOM ORDER
                        </Link>
                        <Link href="/contact" className="text-[13px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-all duration-300">
                            CONTACT
                        </Link>

                        {session ? (
                            <div className="flex items-center space-x-10">
                                {session.user?.role === "admin" && (
                                    <Link href="/admin/artworks" className="text-[13px] tracking-[0.2em] font-medium text-brand-burgundy hover:opacity-70 transition-colors uppercase">
                                        ADMIN
                                    </Link>
                                )}
                                {session.user?.role === "customer" && (
                                    <Link href="/profile" className="text-[13px] tracking-[0.2em] font-medium text-brand-burgundy hover:opacity-70 transition-colors uppercase">
                                        MY ORDERS
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="text-[9px] tracking-[0.25em] font-bold text-[#2E292E] border border-gray-100 px-4 py-2 hover:bg-[#2E292E] hover:text-white hover:border-[#2E292E] transition-all duration-300 rounded-full"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-8 py-3 bg-brand-burgundy text-white text-[11px] tracking-[0.3em] font-bold hover:bg-[#2E292E] transition-all duration-500 rounded-full shadow-lg shadow-brand-burgundy/10"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-brand-burgundy focus:outline-none p-2"
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="bg-white border-t border-gray-50 h-[calc(100vh-80px)]">
                    <div className="px-6 py-12 flex flex-col items-center justify-center space-y-8 h-full">
                        <Link
                            href="/"
                            className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
                            onClick={() => setIsOpen(false)}
                        >
                            HOME
                        </Link>
                        <Link
                            href="/gallery"
                            className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
                            onClick={() => setIsOpen(false)}
                        >
                            GALLERY
                        </Link>
                        <Link
                            href="/order"
                            className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
                            onClick={() => setIsOpen(false)}
                        >
                            CUSTOM ORDER
                        </Link>
                        <Link
                            href="/contact"
                            className="text-lg font-medium tracking-[0.2em] text-gray-800 hover:text-brand-burgundy"
                            onClick={() => setIsOpen(false)}
                        >
                            CONTACT US
                        </Link>

                        <div className="w-12 h-px bg-brand-burgundy/10 mb-4" />

                        {session ? (
                            <div className="flex flex-col items-center space-y-8">
                                {session.user?.role === "admin" && (
                                    <Link
                                        href="/admin/artworks"
                                        className="text-lg font-bold tracking-[0.2em] text-brand-burgundy"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        ADMIN PANEL
                                    </Link>
                                )}
                                {session.user?.role === "customer" && (
                                    <Link
                                        href="/profile"
                                        className="text-lg font-bold tracking-[0.2em] text-brand-burgundy"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        MY ORDERS
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        signOut();
                                    }}
                                    className="px-10 py-3 border border-gray-200 text-sm font-bold tracking-[0.3em] text-gray-400 rounded-full"
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
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
