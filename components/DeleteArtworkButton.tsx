"use client";

import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteArtworkButtonProps {
    artworkId: string;
    artworkTitle: string;
}

export default function DeleteArtworkButton({ artworkId, artworkTitle }: DeleteArtworkButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdmin = (session?.user as any)?.role === "admin";

    if (!isAdmin) return null;

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${artworkTitle}"? This cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/artworks/${artworkId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/gallery");
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete artwork");
            }
        } catch (error) {
            console.error("Error deleting artwork:", error);
            alert("An error occurred while deleting the artwork");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Delete Artwork (Admin Only)"}
        </button>
    );
}
