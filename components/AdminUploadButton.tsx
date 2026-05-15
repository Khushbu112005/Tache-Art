"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import UploadArtworkForm from "./UploadArtworkForm";

export default function AdminUploadButton() {
    const { data: session } = useSession();
    const [showForm, setShowForm] = useState(false);

    // Only show for admin
    if (!session || (session.user as any)?.role !== "admin") {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium tracking-widest uppercase hover:bg-[var(--tache-soft-brown)] transition-colors"
            >
                <Plus size={18} />
                Upload Artwork
            </button>

            {showForm && <UploadArtworkForm onClose={() => setShowForm(false)} />}
        </>
    );
}
