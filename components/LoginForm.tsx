"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup";

export default function LoginForm() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                setLoading(false);
                return;
            }

            // Auto-login after signup
            const loginRes = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (loginRes?.error) {
                setError("Account created! Please log in.");
                setMode("login");
                setLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-white shadow-sm border border-[var(--tache-beige)] rounded-md">
            <h2 className="text-2xl font-bold tracking-widest text-center mb-2 uppercase">
                {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6 tracking-wide">
                {mode === "login" ? "Welcome back to TACHÈ" : "Join TACHÈ today"}
            </p>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-sm text-sm border border-red-100 text-center">
                    {error}
                </div>
            )}

            <form
                onSubmit={mode === "login" ? handleLogin : handleSignup}
                className="space-y-4"
            >
                {mode === "signup" && (
                    <div>
                        <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                            NAME
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                        EMAIL
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                        PASSWORD
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {mode === "signup" && (
                    <div>
                        <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                            CONFIRM PASSWORD
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 mt-4 text-sm font-medium tracking-wide uppercase hover:bg-[var(--tache-soft-brown)] transition-colors disabled:opacity-50"
                >
                    {loading
                        ? mode === "login"
                            ? "Signing in..."
                            : "Creating account..."
                        : mode === "login"
                            ? "Sign In"
                            : "Create Account"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    {mode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}
                    <button
                        onClick={() => {
                            setMode(mode === "login" ? "signup" : "login");
                            setError("");
                        }}
                        className="ml-1 text-black font-semibold hover:text-[var(--tache-soft-brown)] transition-colors underline"
                    >
                        {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
}
