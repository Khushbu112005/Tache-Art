"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Palette, CreditCard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export const userLinks = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Cart", href: "/user/cart", icon: ShoppingBag, badge: true },
    { name: "Orders", href: "/user/orders", icon: Package },
    { name: "Custom Requests", href: "/user/requests", icon: Palette },
    { name: "Payments", href: "/user/payments", icon: CreditCard },
];

export default function UserSidebar() {
    const pathname = usePathname();
    const { totalItems } = useCart();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = "/login";
    };

    return (
        <div className="h-full flex flex-col justify-between p-6 overflow-y-auto">
            <div>
                <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-burgundy mb-8 px-2">Management</h2>
                <nav className="space-y-2">
                    {userLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? "bg-foreground text-white shadow-md shadow-foreground/10 font-bold"
                                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/5 font-medium"
                                }`}
                            >
                                <div className="flex items-center space-x-3.5">
                                    <Icon size={18} />
                                    <span className="text-[11px] font-bold tracking-[0.25em] uppercase">{link.name}</span>
                                </div>
                                {link.badge && totalItems > 0 && (
                                    <span
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                            isActive ? "bg-white text-brand-burgundy" : "bg-brand-burgundy text-white"
                                        }`}
                                    >
                                        {totalItems}
                                    </span>
                                )}
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
