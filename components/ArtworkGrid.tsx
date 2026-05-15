import React from 'react';
import ArtworkCard from './ArtworkCard';

interface Artwork {
    _id: string;
    title: string;
    imageUrl: string;
    price: number;
    description: string;
}

export default function ArtworkGrid({ artworks }: { artworks: Artwork[] }) {
    if (!artworks || artworks.length === 0) {
        return <div className="text-center py-12 text-gray-500 uppercase tracking-widest text-sm">No artworks available.</div>;
    }

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {artworks.map((artwork) => (
                <div key={artwork._id} className="break-inside-avoid mb-6">
                    <ArtworkCard {...artwork} />
                </div>
            ))}
        </div>
    );
}
