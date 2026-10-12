"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, ShoppingBag, CreditCard, LogOut, MessageSquare } from "lucide-react";
import { signOut } from "next-auth/react";

export const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Artworks", href: "/admin/artworks", icon: ImageIcon },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = "/login";
    };

    return (
        <div className="h-full flex flex-col justify-between p-6 overflow-y-auto">
            <div>
                <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-burgundy mb-8 px-2">Management</h2>
                <nav className="space-y-2">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? "bg-foreground text-white shadow-md shadow-foreground/10 font-bold"
                                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5 font-medium"
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-[11px] font-bold tracking-[0.25em] uppercase">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-6 mt-auto border-t border-foreground/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3.5 px-4 py-3.5 w-full text-brand-burgundy hover:bg-brand-burgundy/5 rounded-xl transition-all duration-300 border border-brand-burgundy/10"
                >
                    <LogOut size={18} />
                    <span className="text-[11px] font-bold tracking-[0.25em] uppercase">Logout</span>
                </button>
            </div>
        </div>
    );
}


