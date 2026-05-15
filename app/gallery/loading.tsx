export default function GalleryLoading() {
    return (
        <div className="bg-[var(--tache-cream)] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <div className="h-10 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
                    <div className="h-4 w-72 bg-gray-200 rounded mx-auto animate-pulse" />
                    <div className="h-px w-24 bg-gray-200 mx-auto mt-8" />
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid mb-6">
                            <div className="rounded-md bg-white shadow-sm overflow-hidden">
                                <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
