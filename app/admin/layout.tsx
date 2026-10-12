import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileNav from "@/components/AdminMobileNav";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="min-h-[calc(100vh-5.5rem)] sm:min-h-[calc(100vh-6rem)] bg-[var(--tache-cream)] flex flex-col md:flex-row relative">
            {/* Mobile Admin Navigation Bar */}
            <AdminMobileNav />

            {/* Desktop Fixed Sidebar - stays pinned to the left of the viewport */}
            <aside className="hidden md:block fixed top-[5.5rem] sm:top-[6rem] left-0 bottom-0 w-64 z-40 bg-white border-r border-foreground/5 shadow-sm">
                <AdminSidebar />
            </aside>

            {/* Main Content Area - offset by 64 (16rem) on desktop */}
            <div className="flex-1 md:pl-64 min-w-0 flex flex-col">
                <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}

