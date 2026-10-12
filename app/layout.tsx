import { Asul, Playfair_Display } from "next/font/google";
import { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const asul = Asul({
  variable: "--font-asul",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TACHÈ",
  description: "Raw. Hand-painted. Custom art by Aastha Jain. Hand-crafted paintings, portraits, and custom artwork.",
  icons: {
    icon: [
      { url: "/logo.jpg" },
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F9F8F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="max-w-full">
      <body
        className={`${asul.variable} ${playfair.variable} antialiased min-h-screen flex flex-col font-serif w-full max-w-full`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <div className="flex-grow w-full max-w-full pt-[5.5rem] sm:pt-[6rem]">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
