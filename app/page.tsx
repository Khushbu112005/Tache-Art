import Link from "next/link";
import Image from "next/image";
import { ArtworkService } from "@/services/artwork.service";
import ArtworkGrid from "@/components/ArtworkGrid";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch featured artworks via service layer
  const artworks = await ArtworkService.getFeatured(6);

  // Serialize for client component
  const serializedArtworks = artworks.map((art: Record<string, unknown>) => ({
    _id: (art._id as object).toString(),
    title: art.title as string,
    imageUrl: art.imageUrl as string,
    price: art.price as number,
    description: art.description as string,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-white" />


        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-10">
          <div className="inline-block px-5 py-2 bg-white/50 backdrop-blur-sm border border-brand-burgundy/10 rounded-full mb-4 shadow-sm">
            <span className="text-[11px] font-bold tracking-[0.4em] text-brand-burgundy uppercase">
              Limited Edition Collections
            </span>
          </div>

          <div className="relative">


            <h1 className="text-4xl sm:text-7xl md:text-9xl font-bold tracking-[0.1em] sm:tracking-[0.15em] text-[#2E292E] uppercase leading-tight parallax-text">
              TACHÈ <span className="text-brand-burgundy relative inline-block">
                ART
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-1 bg-brand-burgundy/20 rounded-full" />
              </span>
            </h1>
          </div>

          <p className="text-xs sm:text-base md:text-xl font-medium tracking-[0.2em] sm:tracking-[0.25em] text-gray-400 uppercase max-w-3xl mx-auto leading-relaxed italic opacity-80">
            Raw Hand-painted masterpieces crafted for modern spaces.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              href="/gallery"
              className="px-14 py-6 bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#2E292E] transition-all duration-700 shadow-2xl shadow-brand-burgundy/30 rounded-full w-full sm:w-auto text-center group relative overflow-hidden"
            >
              <span className="relative z-10">SHOP COLLECTION</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link
              href="/order"
              className="px-14 py-6 bg-transparent border-2 border-gray-100 text-[#2E292E] text-[11px] font-bold tracking-[0.4em] uppercase hover:border-brand-burgundy hover:text-brand-burgundy transition-all duration-700 rounded-full w-full sm:w-auto text-center hover:bg-white"
            >
              CUSTOM ORDER
            </Link>
          </div>
        </div>
      </section>

      {/* Campaign Section */}
      <section className="relative w-full overflow-hidden bg-[#F2F2F2] flex flex-col lg:flex-row min-h-[100vh]">
        {/* Left Lifestyle Image */}
        <div className="w-full lg:w-1/3 relative h-[60vh] lg:h-auto">
          <Image
            src="/campaign/lifestyle.png"
            alt="Art Lifestyle"
            fill
            className="object-cover opacity-90"
          />
        </div>

        {/* Center Product Area */}
        <div className="w-full lg:w-1/3 relative py-24 lg:py-0 h-auto min-h-[60vh] flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Large Overlapping Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center select-none pointer-events-none z-0">
            <h2 className="text-[120px] sm:text-[200px] md:text-[280px] font-bold text-black/5 leading-none tracking-tighter">
              CREATE
            </h2>
          </div>

          {/* Floating Product */}
          <div className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] transition-all duration-1000 hover:scale-105">
            <Image
              src="/campaign/product.png"
              alt="Product Spotlight"
              fill
              className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
            />
          </div>

          <div className="relative z-20 mt-8 sm:mt-12 text-center space-y-6">
            <h3 className="text-sm font-bold tracking-[0.4em] text-brand-burgundy uppercase">Pure Craftsmanship</h3>
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-[0.2em] uppercase max-w-xs mx-auto">
              Seamlessly blending emotion with every custom stroke.
            </p>
            <div className="pt-4">
              <Link
                href="/gallery"
                className="inline-block px-10 py-5 bg-white text-black text-[10px] font-bold tracking-[0.3em] uppercase rounded-full shadow-xl hover:bg-brand-burgundy hover:text-white transition-all duration-500"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>

        {/* Right Model/Detail Image */}
        <div className="w-full lg:w-1/3 relative h-[60vh] lg:h-auto">
          <Image
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"
            alt="Art Detail"
            fill
            className="object-cover relative z-10 brightness-[1.02]"
          />
          {/* Express Text Overlay */}
          <div className="absolute bottom-10 left-6 sm:bottom-20 sm:-left-20 z-20">
            <h4 className="text-[60px] sm:text-[100px] lg:text-[120px] font-bold text-[#2E292E]/10 leading-none tracking-tighter uppercase italic">
              EXPRESS.
            </h4>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[0.1em] uppercase text-brand-burgundy">Featured Selection</h2>
              <div className="h-1 w-20 bg-brand-burgundy/10" />
            </div>
            <Link
              href="/gallery"
              className="group flex items-center space-x-4 text-[11px] font-bold tracking-[0.3em] text-gray-400 hover:text-brand-burgundy transition-colors uppercase"
            >
              <span>Explore All</span>
              <div className="w-10 h-px bg-gray-200 group-hover:bg-brand-burgundy transition-colors" />
            </Link>
          </div>

          <ArtworkGrid artworks={serializedArtworks} />
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20 bg-[#FBFBFB]">
        <div className="container mx-auto">
          <div className="text-center mb-20 space-y-4">
            <p className="text-[10px] font-bold tracking-[0.4em] text-brand-burgundy uppercase">The Craft</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[0.1em] uppercase text-[#2E292E]">Our Expertise</h2>
            <div className="h-1 w-20 bg-brand-burgundy/10 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {/* Canvas */}
            <div className="space-y-8 text-center group hover-lift">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] shadow-lg">
                <Image
                  src="/expertise/canvas.png"
                  alt="Canvas Painting"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-[0.2em] text-[#2E292E] uppercase">Canvas Paintings</h3>
                <p className="text-xs text-gray-400 font-medium tracking-widest uppercase leading-relaxed">
                  Original works on premium canvas surfaces, bringing life to every stroke.
                </p>
              </div>
            </div>

            {/* Instruments */}
            <div className="space-y-8 text-center group hover-lift">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] shadow-lg">
                <Image
                  src="/expertise/instruments.png"
                  alt="Instrument Customization"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-[0.2em] text-[#2E292E] uppercase">Instruments</h3>
                <p className="text-xs text-gray-400 font-medium tracking-widest uppercase leading-relaxed">
                  Bespoke hand-painted designs for guitars, ukuleles, and musical gear.
                </p>
              </div>
            </div>

            {/* Fabric */}
            <div className="space-y-8 text-center group hover-lift">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] shadow-lg">
                <Image
                  src="/expertise/fabric.png"
                  alt="Fabric Painting"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-[0.2em] text-[#2E292E] uppercase">Fabric Art</h3>
                <p className="text-xs text-gray-400 font-medium tracking-widest uppercase leading-relaxed">
                  Wearable art and custom textile paintings crafted with durability in mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About/Artist Section */}
      <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
            <div className="relative aspect-[3/4] sm:aspect-square overflow-hidden rounded-[40px] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1974&auto=format&fit=crop"
                alt="Artist Tooling"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-brand-burgundy/5" />
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-bold tracking-[0.4em] text-brand-burgundy uppercase">The Philosophy</p>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-[0.1em] uppercase text-[#2E292E] leading-tight">Every Stroke <br />Tells a Story</h2>
              </div>

              <div className="space-y-6 text-sm sm:text-base text-gray-500 font-medium leading-loose tracking-wide">
                <p>
                  Welcome to TACHÈ, where art isn't just decoration—it's an experience. Founded by Aastha Jain, our studio focuses on the raw intersection of emotion and canvas.
                </p>
                <p>
                  Specializing in custom hand-painted portraits and abstract movements, we believe your space should reflect the uniqueness of your journey.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center space-x-6 group"
                >
                  <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-burgundy border-b-2 border-brand-burgundy pb-2 group-hover:opacity-70 transition-all">Connect with the artist</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
