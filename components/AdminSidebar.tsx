"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, ShoppingBag, CreditCard, LogOut, MessageSquare } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Artworks", href: "/admin/artworks", icon: ImageIcon },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    ];

    return (
        <aside className="w-64 bg-background border-r border-foreground/5 min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-8">
                <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-brand-burgundy mb-10">Management</h2>
                <nav className="space-y-4 flex-grow">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? "bg-foreground text-white shadow-lg shadow-foreground/10"
                                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-8 mt-auto">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center space-x-4 px-4 py-4 w-full text-brand-burgundy hover:bg-brand-burgundy/5 rounded-xl transition-all duration-300 border border-brand-burgundy/10"
                >
                    <LogOut size={18} />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Logout</span>
                </button>
            </div>
        </aside>
    );
}

