"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                setFormData({ name: "", email: "", message: "" });
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Failed to connect to the server. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
                {/* Intro Text */}
                <div className="text-center mb-12">
                    <p className="text-lg text-[#6b3a3a] leading-relaxed mb-10">
                        We&apos;d love to hear from you at TACHÈ! Whether you have a question, need assistance, or want to share feedback, our team is always here to help.
                    </p>

                    <p className="text-lg text-[#6b3a3a] mb-6">
                        <span className="font-semibold">Email:</span>{" "}
                        <a href="mailto:aasthajainokok@gmail.com" className="underline hover:text-[var(--tache-soft-brown)] transition-colors">
                            aasthajainokok@gmail.com
                        </a>
                    </p>

                    <p className="text-lg text-[#6b3a3a] mb-10">
                        <span className="font-semibold">Instagram:</span>{" "}
                        <a href="https://www.instagram.com/tache.in" target="_blank" rel="noreferrer" className="underline hover:text-[var(--tache-soft-brown)] transition-colors">
                            @tache.in
                        </a>
                    </p>

                    <p className="text-lg text-[#6b3a3a] leading-relaxed">
                        We value your feedback and inquiries. Please complete the form below, and we will respond to you as swiftly as possible.
                    </p>
                </div>

                {/* Contact Form */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-8 text-sm text-center">
                        {error}
                    </div>
                )}
                
                {submitted ? (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-[#6b3a3a] mb-4">Thank you!</h2>
                        <p className="text-lg text-gray-600">
                            Your message has been sent. We&apos;ll get back to you as soon as possible.
                        </p>
                        <button onClick={() => setSubmitted(false)} className="mt-8 px-6 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition">
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
                        {/* Name */}
                        <div>
                            <label htmlFor="contact-name" className="block text-base font-semibold text-gray-900 mb-2">
                                Your name <span className="text-red-500">*</span>
                            </label>
                            <input id="contact-name" type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[var(--tache-soft-brown)] transition-colors bg-white" />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="contact-email" className="block text-base font-semibold text-gray-900 mb-2">
                                Your email <span className="text-red-500">*</span>
                            </label>
                            <input id="contact-email" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[var(--tache-soft-brown)] transition-colors bg-white" />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="contact-message" className="block text-base font-semibold text-gray-900 mb-2">
                                Your message <span className="text-red-500">*</span>
                            </label>
                            <textarea id="contact-message" name="message" placeholder="Enter your message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[var(--tache-soft-brown)] transition-colors bg-white resize-vertical" />
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button type="submit" disabled={loading} className={`px-8 py-3 bg-[#a8584c] text-white text-base font-semibold rounded-full hover:bg-[#8f4a3f] transition-colors tracking-wide ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
                                {loading ? "Sending..." : "Send message"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
