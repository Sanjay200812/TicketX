import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { calculateBookingTotal } from "@/lib/pricing/calculateBookingTotal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieId, theatreId, showId, seatIds, seatPrices, accountKey } = body;

    if (!movieId || !theatreId || !showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid booking payload. Movie, Theatre, Show, and Seats are required." },
        { status: 400 }
      );
    }

    // Recalculate price server-side from trusted data (Requirements 8, 9)
    const pricing = calculateBookingTotal({
      theatreId,
      showId,
      seatIds,
      seatPrices,
    });

    const amountPaise = Math.round(pricing.total * 100);
    const internalOrderId = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Create Razorpay Order server-side (Requirements 1, 10, 11)
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: internalOrderId.slice(0, 40),
      notes: {
        movieId,
        theatreId,
        showId,
        seatCount: String(seatIds.length),
        accountKey: accountKey || "guest",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      pricing: {
        seatSubtotal: pricing.seatSubtotal,
        bookingFee: pricing.bookingFee,
        total: pricing.total,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unable to start secure payment order.";
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
