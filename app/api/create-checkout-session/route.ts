// app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Simple GET so we can sanity-check the route in the browser
export async function GET() {
  return NextResponse.json({ ok: true });
}

// Create a Checkout Session
export async function POST(req: Request) {
  try {
    const origin = new URL(req.url).origin; // works on preview + prod
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Yard Sale Booth Reservation" },
            unit_amount: 1000, // $10
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Stripe checkout session failed." },
      { status: 500 }
    );
  }
}
