import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingDetails,
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay verification credentials." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Server configuration missing." },
        { status: 500 }
      );
    }

    // HMAC SHA-256 signature verification (Requirements 22, 24)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    // Timing-safe signature comparison (Requirement 24)
    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      console.error("Razorpay signature verification failed!");
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Generate verified booking record
    const bookingId = `TX-RZP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const confirmedBooking = {
      id: bookingId,
      movieId: bookingDetails?.movieId,
      movieTitle: bookingDetails?.movieTitle,
      theatre: bookingDetails?.theatreName,
      screen: bookingDetails?.screenName || "Screen 1",
      date: bookingDetails?.date,
      time: bookingDetails?.time,
      seats: bookingDetails?.seats || [],
      ticketCount: (bookingDetails?.seats || []).length,
      subtotal: bookingDetails?.subtotal,
      convenienceFee: bookingDetails?.convenienceFee,
      total: bookingDetails?.total,
      payment: {
        provider: "razorpay",
        mode: "test",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "verified",
      },
      status: "upcoming",
      archived: false,
      bookingDate: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      bookingId,
      booking: confirmedBooking,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "An error occurred during verification.";
    console.error("Razorpay payment verification exception:", error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
