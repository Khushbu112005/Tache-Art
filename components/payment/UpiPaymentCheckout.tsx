"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import {
  QrCode,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
} from "lucide-react";
import { DEFAULT_UPI_ID, DEFAULT_UPI_NAME, DEFAULT_UPI_QR_IMAGE } from "@/utils/constants";

interface UpiPaymentCheckoutProps {
  amount: number;
  artworkId?: string;
  artworkTitle?: string;
  artworkImage?: string;
  buttonText?: string;
  buttonClassName?: string;
  onSuccess?: () => void;
}

export default function UpiPaymentCheckout({
  amount,
  artworkId,
  artworkTitle = "Artwork",
  artworkImage,
  buttonText = "Pay with UPI / QR Code",
  buttonClassName,
  onSuccess,
}: UpiPaymentCheckoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [qrMode, setQrMode] = useState<"official" | "dynamic">("official");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Customer Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [senderUpi, setSenderUpi] = useState("");
  const [notes, setNotes] = useState("");

  // Effective values falling back to session
  const effectiveName = name || session?.user?.name || "";
  const effectiveEmail = email || session?.user?.email || "";

  // Screenshot Upload State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<Record<string, unknown> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || DEFAULT_UPI_ID;
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || DEFAULT_UPI_NAME;
  const officialQrImage = process.env.NEXT_PUBLIC_UPI_QR_IMAGE || DEFAULT_UPI_QR_IMAGE;

  // Construct standard UPI deep link intent
  const cleanTitle = encodeURIComponent((artworkTitle || "Art").slice(0, 20));
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${cleanTitle}`;

  // Generate dynamic QR Code when modal opens
  useEffect(() => {
    if (isOpen && amount > 0) {
      QRCode.toDataURL(upiUri, {
        width: 340,
        margin: 2,
        color: {
          dark: "#1A161A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err: unknown) => console.error("Dynamic QR generation failed", err));
    }
  }, [isOpen, upiUri, amount]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleOpenModal = () => {
    // If not logged in, user can still proceed with guest info, or prefill if available
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
    setStep(1);
    setErrorMessage("");
    setSubmittedOrder(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const nameToSubmit = effectiveName.trim();
    const emailToSubmit = effectiveEmail.trim();

    if (!nameToSubmit) return setErrorMessage("Please enter your name.");
    if (!emailToSubmit || !emailToSubmit.includes("@")) return setErrorMessage("Please enter a valid email address.");
    if (!phone.trim()) return setErrorMessage("Please enter your contact phone number.");
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      return setErrorMessage("Please enter a valid 12-digit UTR / UPI Transaction Reference ID.");
    }
    if (!screenshotFile) {
      return setErrorMessage("Please upload a screenshot or photo of your payment receipt.");
    }

    try {
      setIsUploading(true);

      // 1. Upload screenshot receipt to Cloudinary / storage API
      const formData = new FormData();
      formData.append("file", screenshotFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload screenshot. Please try a smaller image (JPG/PNG).");
      }

      const uploadData = await uploadRes.json();
      const screenshotUrl = uploadData.data?.secure_url || uploadData.secure_url;

      if (!screenshotUrl) {
        throw new Error("Unable to retrieve screenshot link. Please try again.");
      }

      setIsUploading(false);
      setIsSubmitting(true);

      // 2. Submit payment and order details
      const payload = {
        amount,
        artworkId: artworkId || undefined,
        artworkTitle,
        name: nameToSubmit,
        email: emailToSubmit,
        phone: phone.trim(),
        shippingAddress: shippingAddress.trim() || undefined,
        utrNumber: utrNumber.trim(),
        screenshotUrl,
        senderUpi: senderUpi.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/payment/manual-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || resData.message || "Failed to submit verification.");
      }

      setSubmittedOrder(resData.data);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred while submitting payment.");
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        className={
          buttonClassName ||
          "w-full bg-brand-burgundy hover:bg-[#2E292E] text-white py-4 px-6 text-[11px] font-bold tracking-[0.25em] uppercase transition-all duration-300 rounded-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
        }
      >
        <QrCode className="w-4 h-4 transition-transform group-hover:scale-110 text-[#E6C687]" />
        <span>{buttonText}</span>
      </button>

      {/* Payment Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[96vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#2E292E] text-white p-4 sm:p-7 relative shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-[#E6C687] text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Direct UPI Payment</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif tracking-wide text-white font-bold">
                    {submittedOrder ? "Payment Under Verification" : "Pay via UPI / QR Code"}
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                    {artworkTitle}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block">
                    Amount to Pay
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6C687]">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Steps Progress Indicator */}
              {!submittedOrder && (
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      step === 1
                        ? "bg-[#E6C687] text-[#2E292E] shadow-sm font-extrabold"
                        : "bg-white/10 text-gray-300 hover:bg-white/15"
                    }`}
                  >
                    <span>1. Scan & Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      step === 2
                        ? "bg-[#E6C687] text-[#2E292E] shadow-sm font-extrabold"
                        : "bg-white/10 text-gray-300 hover:bg-white/15"
                    }`}
                  >
                    <span>2. Enter UTR & Receipt</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            {submittedOrder ? (
              /* Success / Pending Verification View */
              <div className="p-6 sm:p-10 text-center space-y-6 overflow-y-auto">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold tracking-widest uppercase rounded-full">
                    Payment Pending Verification
                  </span>
                  <h4 className="text-2xl font-bold text-[#2E292E] font-serif">
                    Order Submitted Successfully!
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Thank you! We have received your payment confirmation and screenshot. Our team will verify the payment against our bank account shortly.
                  </p>
                </div>

                {/* Details Card */}
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#F0EAE1] max-w-md mx-auto text-left text-xs space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-gray-200/60">
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Order Reference
                    </span>
                    <span className="font-mono font-bold text-[#2E292E]">
                      {(submittedOrder as { order?: { _id?: string } })?.order?._id || "Recorded"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200/60">
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      UTR / Transaction ID
                    </span>
                    <span className="font-mono font-bold text-brand-burgundy">
                      {utrNumber}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200/60">
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Payee UPI ID
                    </span>
                    <span className="font-mono text-gray-700">{upiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Total Amount
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/user/orders");
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-burgundy text-white text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#2E292E] rounded-full transition-all shadow-md"
                  >
                    View My Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/gallery");
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 text-gray-700 text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-gray-100 rounded-full transition-all"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-8 overflow-y-auto space-y-5 sm:space-y-6">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* STEP 1: SCAN AND PAY */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Payee Info & 1-Click Copy */}
                    <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#EFE8DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                          Verified Payee Details
                        </span>
                        <h4 className="text-base font-bold text-[#2E292E]">
                          {upiName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-white px-2.5 py-1 rounded-md text-xs font-mono font-bold text-brand-burgundy border border-gray-200">
                            {upiId}
                          </code>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">Copied UPI ID!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-gray-500" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* QR Code Presentation Box */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      {/* Toggle QR Format */}
                      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setQrMode("official")}
                          className={`px-4 py-1.5 rounded-lg transition-all ${
                            qrMode === "official"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          Official QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrMode("dynamic")}
                          className={`px-4 py-1.5 rounded-lg transition-all ${
                            qrMode === "dynamic"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          Auto-Amount QR (₹{amount.toLocaleString("en-IN")})
                        </button>
                      </div>

                      {/* Display QR */}
                      <div className="relative w-64 h-64 sm:w-72 sm:h-72 p-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
                        {qrMode === "official" ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={officialQrImage}
                              alt="Official UPI QR Code"
                              fill
                              className="object-contain rounded-xl"
                              priority
                            />
                          </div>
                        ) : qrDataUrl ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                              src={qrDataUrl}
                              alt="Dynamic UPI QR Code"
                              width={280}
                              height={280}
                              className="rounded-lg object-contain"
                              priority
                            />
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-brand-burgundy border-t-transparent rounded-full animate-spin" />
                            <span>Generating QR...</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold tracking-wider text-gray-700 uppercase">
                          Scan with any UPI app
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Google Pay • PhonePe • Paytm • BHIM • Cred • Any Banking App
                        </p>
                      </div>

                      {/* Mobile Deep Link Intent Button */}
                      <a
                        href={upiUri}
                        className="sm:hidden w-full py-3 px-4 bg-brand-burgundy text-white text-center text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Tap to Pay in Your UPI App</span>
                      </a>
                    </div>

                    {/* Step Guidance */}
                    <div className="bg-[#FAF7F2] p-4 rounded-xl text-xs space-y-2 text-gray-600 border border-[#F0EAE1]">
                      <p className="font-bold text-[#2E292E] uppercase tracking-wider text-[10px]">
                        Payment Instructions:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px]">
                        <li>Scan the QR code or transfer <strong>₹{amount.toLocaleString("en-IN")}</strong> to <strong>{upiId}</strong>.</li>
                        <li>Take a screenshot or receipt photo of the successful transaction.</li>
                        <li>Note down the <strong>12-digit UTR / UPI Transaction Reference Number</strong>.</li>
                        <li>Click the button below to submit your verification details.</li>
                      </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-500 hover:text-[#2E292E] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-100 rounded-full transition-all order-2 sm:order-1 text-center"
                      >
                        Cancel & Close
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-[#2E292E] rounded-full transition-all shadow-md flex items-center justify-center gap-2 group order-1 sm:order-2"
                      >
                        <span>I Have Completed Payment</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: VERIFICATION DETAILS */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#F0EAE1] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {artworkImage && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                            <Image src={artworkImage} alt={artworkTitle} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                            Paying for
                          </span>
                          <span className="font-bold text-[#2E292E] line-clamp-1">
                            {artworkTitle}
                          </span>
                        </div>
                      </div>
                      <span className="text-base font-bold text-brand-burgundy">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-700 mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={effectiveName}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={effectiveEmail}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-700 mb-1">
                          Contact Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-700 mb-1">
                          12-Digit UTR / Transaction ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 402837492819"
                          className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-1">
                        Shipping Address (Optional for customized art or delivery)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street, City, State, Postal PIN code"
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                      />
                    </div>

                    {/* Screenshot Upload Dropzone */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-700 mb-1.5">
                        Payment Screenshot / Receipt Photo *
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                          screenshotPreview
                            ? "border-green-400 bg-green-50/30"
                            : "border-gray-300 hover:border-brand-burgundy bg-[#FAF7F2]"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        {screenshotPreview ? (
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                              <Image
                                src={screenshotPreview}
                                alt="Payment Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">
                                {screenshotFile?.name}
                              </p>
                              <p className="text-[10px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Screenshot attached
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1 underline">
                                Click to choose a different photo
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-brand-burgundy/10 text-brand-burgundy flex items-center justify-center mb-2">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-gray-700">
                              Click to upload transaction receipt screenshot
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              JPG, PNG, JPEG, WebP up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Optional sender UPI ID & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
                          Your UPI ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={senderUpi}
                          onChange={(e) => setSenderUpi(e.target.value)}
                          placeholder="e.g. rahul@okaxis"
                          className="w-full px-3.5 py-2.5 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Helps us quickly match with our bank statement
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
                          Order Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Special requests or instructions"
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-burgundy bg-white"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 sm:flex-initial px-5 py-3 border border-gray-300 text-gray-600 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-100 rounded-full transition-colors text-center"
                        >
                          Back to QR
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            setStep(1);
                          }}
                          className="flex-1 sm:flex-initial px-5 py-3 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors text-center"
                        >
                          Cancel & Exit
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="w-full sm:w-auto px-8 sm:px-10 py-3.5 bg-brand-burgundy text-white text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-[#2E292E] disabled:opacity-50 transition-all rounded-full shadow-xl flex items-center justify-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading Receipt...</span>
                          </>
                        ) : isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Verification...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-[#E6C687]" />
                            <span>Submit for Verification</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
