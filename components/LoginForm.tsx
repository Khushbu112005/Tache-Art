"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

export default function LoginForm() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [forgotStep, setForgotStep] = useState<1 | 2>(1);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Auto-detect reset link from email: ?mode=reset&email=...&code=...
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const urlMode = params.get("mode");
            const urlEmail = params.get("email");
            const urlCode = params.get("code");

            if (urlMode === "reset" && (urlEmail || urlCode)) {
                setMode("forgot");
                setForgotStep(2);
                if (urlEmail) setEmail(urlEmail);
                if (urlCode) setResetCode(urlCode);
            }
        }
    }, []);

    const resetMessages = () => {
        setError("");
        setSuccess("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

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
        } catch {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

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
                setSuccess("Account created! Confirmation email dispatched. Please sign in.");
                setMode("login");
                setLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    // Step 1: Request 6-digit reset code
    const handleRequestResetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send reset code. Please try again.");
                setLoading(false);
                return;
            }

            setSuccess("We have sent a 6-digit reset code to your email inbox.");
            setForgotStep(2);
            setLoading(false);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    // Step 2: Submit 6-digit reset code with new password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        if (password !== confirmPassword) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    code: resetCode,
                    newPassword: password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password. Please try again.");
                setLoading(false);
                return;
            }

            setSuccess("Password has been reset successfully! You can now sign in.");
            setMode("login");
            setPassword("");
            setConfirmPassword("");
            setResetCode("");
            setForgotStep(1);
            setLoading(false);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-5 sm:p-8 bg-white shadow-sm border border-[var(--tache-beige)] rounded-xl sm:rounded-2xl">
            {/* Header Titles */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-widest uppercase">
                    {mode === "login"
                        ? "Sign In"
                        : mode === "signup"
                        ? "Create Account"
                        : "Reset Password"}
                </h2>
                <p className="text-gray-500 text-sm mt-1 tracking-wide">
                    {mode === "login"
                        ? "Welcome back to TACHÈ"
                        : mode === "signup"
                        ? "Join TACHÈ today"
                        : forgotStep === 1
                        ? "Enter your email to receive a 6-digit verification code"
                        : "Enter the code sent to your email and set a new password"}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-md text-sm border border-red-100 text-center">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-emerald-50 text-emerald-700 p-3 mb-4 rounded-md text-sm border border-emerald-100 flex items-center justify-center gap-2 text-center">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{success}</span>
                </div>
            )}

            {/* Login & Signup Forms */}
            {mode !== "forgot" && (
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
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium tracking-wide text-gray-700">
                                PASSWORD
                            </label>
                            {mode === "login" && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode("forgot");
                                        setForgotStep(1);
                                        resetMessages();
                                    }}
                                    className="text-xs text-brand-burgundy hover:underline tracking-wide font-medium cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
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
                        className="w-full bg-black text-white py-3 mt-4 text-sm font-medium tracking-wide uppercase hover:bg-[var(--tache-soft-brown)] transition-colors disabled:opacity-50 cursor-pointer"
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
            )}

            {/* Forgot Password Flow */}
            {mode === "forgot" && (
                <div className="space-y-4">
                    {forgotStep === 1 ? (
                        <form onSubmit={handleRequestResetCode} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                    REGISTERED EMAIL
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 text-sm font-medium tracking-wide uppercase hover:bg-[var(--tache-soft-brown)] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <KeyRound size={16} />
                                {loading ? "Sending Code..." : "Send Reset Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                    EMAIL
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-sm text-gray-600 text-sm"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                    6-DIGIT VERIFICATION CODE
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                                    placeholder="e.g. 583921"
                                    className="w-full px-4 py-2 text-center tracking-[0.4em] font-mono text-lg font-bold border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--tache-soft-brown)] focus:border-[var(--tache-soft-brown)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                    NEW PASSWORD
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password (min. 6 characters)"
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

                            <div>
                                <label className="block text-sm font-medium tracking-wide text-gray-700 mb-1">
                                    CONFIRM NEW PASSWORD
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password"
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 text-sm font-medium tracking-wide uppercase hover:bg-[var(--tache-soft-brown)] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Resetting Password..." : "Update Password"}
                            </button>

                            <div className="text-center pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotStep(1);
                                        resetMessages();
                                    }}
                                    className="text-xs text-gray-500 hover:text-black transition-colors cursor-pointer"
                                >
                                    Didn't get code? Resend
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="pt-2 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setForgotStep(1);
                                resetMessages();
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black font-medium transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Back to Sign In
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Switcher */}
            {mode !== "forgot" && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}
                        <button
                            onClick={() => {
                                setMode(mode === "login" ? "signup" : "login");
                                resetMessages();
                            }}
                            className="ml-1 text-black font-semibold hover:text-[var(--tache-soft-brown)] transition-colors underline cursor-pointer"
                        >
                            {mode === "login" ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}
