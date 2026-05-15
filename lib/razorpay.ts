import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

/**
 * Lazy-initialize Razorpay so missing keys don't crash the entire app.
 * Only throws when a payment route actually tries to use Razorpay.
 */
function getRazorpay(): Razorpay {
  if (razorpayInstance) return razorpayInstance;

  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is not defined in environment variables");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables");
  }

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return razorpayInstance;
}

export default getRazorpay;
