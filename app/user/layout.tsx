import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import UserMobileNav from "@/components/UserMobileNav";
import React from "react";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-[calc(100vh-5.5rem)] sm:min-h-[calc(100vh-6rem)] bg-[#FDFBF7] flex flex-col md:flex-row relative">
            {/* Mobile User Navigation Bar */}
            <UserMobileNav />

            {/* Desktop Fixed Sidebar - stays pinned to the left of the viewport */}
            <aside className="hidden md:block fixed top-[5.5rem] sm:top-[6rem] left-0 bottom-0 w-64 z-40 bg-white border-r border-foreground/5 shadow-sm">
                <UserSidebar />
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
