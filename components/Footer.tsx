import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="relative bg-[#FFFFFF] border-t border-gray-100 py-16 sm:py-24">
            <div className="container mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-6">
                        <Link href="/" className="text-2xl font-bold tracking-[0.3em] text-brand-burgundy">
                            TACHÈ
                        </Link>
                        <p className="text-[11px] leading-relaxed text-gray-500 uppercase tracking-[0.2em] font-medium">
                            Raw. Hand-painted.<br />Unique Custom Art.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-burgundy">Shop</h4>
                        <ul className="space-y-4">
                            <li><Link href="/gallery" className="text-[11px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-colors">ALL ARTWORKS</Link></li>
                            <li><Link href="/order" className="text-[11px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-colors">CUSTOM ORDER</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-burgundy">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/contact" className="text-[11px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-colors">CONTACT US</Link></li>
                            <li><Link href="/login" className="text-[11px] tracking-[0.2em] font-medium text-gray-500 hover:text-brand-burgundy transition-colors">LOGIN / REGISTER</Link></li>
                        </ul>
                    </div>

                    {/* Social/Contact */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-burgundy">Connect</h4>
                        <div className="flex space-x-6 pt-2">
                            <a href="https://www.instagram.com/tache.in" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-burgundy transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="https://wa.me/919321449323" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-burgundy transition-colors">
                                <FaWhatsapp size={20} />
                            </a>
                            <a href="mailto:aasthajainokok@gmail.com" className="text-gray-400 hover:text-brand-burgundy transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] tracking-[0.2em] font-bold text-gray-300 uppercase">
                    <p>&copy; {new Date().getFullYear()} TACHÈ. ALL RIGHTS RESERVED.</p>
                    <div className="flex space-x-8">

                    </div>
                </div>
            </div>
        </footer>
    );
}
