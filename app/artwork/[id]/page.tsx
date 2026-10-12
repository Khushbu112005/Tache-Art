import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { Types } from "mongoose";
import UpiPaymentCheckout from "@/components/payment/UpiPaymentCheckout";
import AddToCartButton from "@/components/cart/AddToCartButton";

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
    <div className="bg-white min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-20">
      <div className="container mx-auto max-w-7xl">
        <Link
          href="/gallery"
          className="inline-flex items-center text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-brand-burgundy mb-6 sm:mb-10 transition-all group"
        >
          <span className="mr-4">&larr;</span>
          <span className="border-b border-gray-100 group-hover:border-brand-burgundy pb-1">Back to Museum</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-stretch">
          {/* Image Side */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[320px] sm:min-h-[450px] bg-[#F9F8F6] shadow-sm rounded-[24px] sm:rounded-[40px] overflow-hidden w-full transition-transform duration-700 hover:scale-[1.01]">
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
          <div className="flex flex-col justify-between h-full py-1">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-[10px] tracking-[0.4em] text-brand-burgundy font-bold uppercase">
                  {serializedArt.category}
                </p>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-[0.05em] sm:tracking-[0.1em] uppercase text-[#2E292E] leading-tight break-words">
                  {serializedArt.title}
                </h1>
                <p className="text-2xl font-bold tracking-[0.1em] text-[#2E292E] pt-2">
                  ₹{serializedArt.price.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Tags & Details */}
              {(serializedArt.tags.length > 0 || serializedArt.medium || serializedArt.dimensions) && (
                <div className="flex flex-wrap gap-2 pt-2">
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
            </div>

            <div className="pt-8 space-y-4 mt-auto">
              {/* Add to Cart */}
              {!serializedArt.isSold && (
                <AddToCartButton
                  item={{
                    id: serializedArt._id,
                    title: serializedArt.title,
                    imageUrl: serializedArt.imageUrl,
                    price: serializedArt.price,
                    category: serializedArt.category,
                  }}
                  variant="primary"
                />
              )}

              {/* Direct UPI Payment */}
              {!serializedArt.isSold && (
                <UpiPaymentCheckout
                  amount={serializedArt.price}
                  artworkId={serializedArt._id}
                  artworkTitle={serializedArt.title}
                  artworkImage={serializedArt.imageUrl}
                  buttonText="Pay via UPI / QR Code"
                />
              )}

              <Link
                href={`/order?ref=${serializedArt._id}&title=${encodeURIComponent(serializedArt.title)}`}
                className="block w-full text-center border border-gray-200 text-[#2E292E] px-4 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase hover:border-brand-burgundy hover:text-brand-burgundy transition-all duration-500 rounded-sm"
              >
                INQUIRE & CUSTOMIZE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
