"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { userLinks } from "./UserSidebar";
import { useCart } from "@/context/CartContext";

export default function UserMobileNav() {
    const pathname = usePathname();
    const { totalItems } = useCart();

    return (
        <div className="md:hidden sticky top-[5.5rem] sm:top-[6rem] z-30 bg-white/95 backdrop-blur-md border-b border-foreground/5 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto shadow-sm">
            {userLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                            isActive
                                ? "bg-foreground text-white font-bold shadow-sm"
                                : "text-foreground/60 hover:bg-foreground/5 font-medium"
                        }`}
                    >
                        <Icon size={14} />
                        <span className="uppercase text-[10px] tracking-wider">{link.name}</span>
                        {link.badge && totalItems > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-brand-burgundy text-white rounded-full font-bold">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
