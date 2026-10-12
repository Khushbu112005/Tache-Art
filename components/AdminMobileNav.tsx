"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, ShoppingBag, CreditCard, MessageSquare } from "lucide-react";

export default function AdminMobileNav() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Artworks", href: "/admin/artworks", icon: ImageIcon },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    ];

    return (
        <div className="md:hidden sticky top-[5.5rem] sm:top-[6rem] z-30 bg-white/95 backdrop-blur-md border-b border-foreground/5 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center space-x-2 overflow-x-auto shadow-sm">
            {links.map((link) => {
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
                        <span className="uppercase text-[10px]   tracking-wider">{link.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
