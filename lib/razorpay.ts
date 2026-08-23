import "server-only";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Razorpay server configuration is missing in environment variables.");
}

// Requirement 45: Test key check
if (!keyId.startsWith("rzp_test_")) {
  console.warn("WARNING: TicketX Razorpay integration is configured for TEST MODE only.");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
