import "server-only";
import Razorpay from "razorpay";

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_fallback";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "fallback_secret";

  if (!keyId.startsWith("rzp_test_")) {
    console.warn("WARNING: TicketX Razorpay integration is configured for TEST MODE only.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const razorpay = getRazorpayClient();
