import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { Types } from "mongoose";
import DeleteArtworkButton from "@/components/DeleteArtworkButton";
import RazorpayCheckout from "@/components/payment/RazorpayCheckout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const resParams = await params;
  if (!Types.ObjectId.isValid(resParams.id)) return { title: "Artwork Error" };

  try {
    const artwork = await Artwork.findById(resParams.id);
    if (!artwork) return { title: "Artwork Not Found" };
    return { title: `${artwork.title} | TACHÈ` };
  } catch {
    return { title: "Artwork Error" };
  }
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const resParams = await params;
  if (!Types.ObjectId.isValid(resParams.id)) {
    notFound();
  }

  let artwork;
  try {
    artwork = await Artwork.findById(resParams.id).lean();
  } catch {
    notFound();
  }

  if (!artwork) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  const serializedArt = {
    _id: (artwork as Record<string, unknown>)._id?.toString() || "",
    title: (artwork as Record<string, unknown>).title as string,
    imageUrl: (artwork as Record<string, unknown>).imageUrl as string,
    price: (artwork as Record<string, unknown>).price as number,
    description: (artwork as Record<string, unknown>).description as string,
    category: (artwork as Record<string, unknown>).category as string,
    isSold: (artwork as Record<string, unknown>).isSold as boolean,
    tags: ((artwork as Record<string, unknown>).tags as string[]) || [],
    medium: ((artwork as Record<string, unknown>).medium as string) || "",
    dimensions: ((artwork as Record<string, unknown>).dimensions as string) || "",
  };

  return (
    <div className="bg-white min-h-screen py-16 sm:py-24 lg:py-32 px-6 sm:px-10 lg:px-24">
      <div className="container mx-auto max-w-7xl">
        <Link
          href="/gallery"
          className="inline-flex items-center text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-brand-burgundy mb-8 sm:mb-12 transition-all group"
        >
          <span className="mr-4">&larr;</span>
          <span className="border-b border-gray-100 group-hover:border-brand-burgundy pb-1">Back to Museum</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 lg:gap-32 items-start">
          {/* Image Side */}
          <div className="relative aspect-[4/5] bg-[#FBFBFB] shadow-2xl rounded-[24px] sm:rounded-[40px] overflow-hidden w-full transition-transform duration-700 hover:scale-[1.02]">
            <Image
              src={serializedArt.imageUrl}
              alt={serializedArt.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {serializedArt.isSold && (
              <div className="absolute top-4 right-4 bg-brand-burgundy text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                Sold
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="flex flex-col space-y-8 sm:space-y-12 py-4 lg:py-8 lg:sticky lg:top-32">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-[10px] tracking-[0.4em] text-brand-burgundy font-bold uppercase">
                {serializedArt.category}
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-[0.1em] uppercase text-[#2E292E] leading-tight">
                {serializedArt.title}
              </h1>
              <p className="text-2xl font-bold tracking-[0.1em] text-[#2E292E] pt-4">
                ₹{serializedArt.price.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Tags & Details */}
            {(serializedArt.tags.length > 0 || serializedArt.medium || serializedArt.dimensions) && (
              <div className="flex flex-wrap gap-2">
                {serializedArt.medium && (
                  <span className="px-3 py-1 bg-[#FBFBFB] border border-gray-100 rounded-full text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                    {serializedArt.medium}
                  </span>
                )}
                {serializedArt.dimensions && (
                  <span className="px-3 py-1 bg-[#FBFBFB] border border-gray-100 rounded-full text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                    {serializedArt.dimensions}
                  </span>
                )}
                {serializedArt.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-brand-burgundy/5 border border-brand-burgundy/10 rounded-full text-[10px] font-bold tracking-[0.2em] text-brand-burgundy uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="h-px w-full bg-gray-100" />

            <div className="prose prose-sm text-gray-500 font-medium leading-[2] tracking-wide max-w-none">
              <p>{serializedArt.description}</p>
            </div>

            <div className="pt-8 space-y-4">
              {/* Razorpay Payment */}
              {!serializedArt.isSold && (
                <RazorpayCheckout
                  amount={serializedArt.price}
                  artworkId={serializedArt._id}
                  artworkTitle={serializedArt.title}
                />
              )}

              <Link
                href={`/order?ref=${serializedArt._id}&title=${encodeURIComponent(serializedArt.title)}`}
                className="block w-full text-center border border-gray-200 text-[#2E292E] px-10 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:border-brand-burgundy hover:text-brand-burgundy transition-all duration-500 rounded-sm"
              >
                INQUIRE & CUSTOMIZE
              </Link>

              <div className="flex flex-col items-center space-y-4">
                <p className="text-[10px] text-gray-400 tracking-[0.2em] font-bold uppercase text-center">
                  One of a kind original piece.
                </p>
                <DeleteArtworkButton artworkId={serializedArt._id} artworkTitle={serializedArt.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
