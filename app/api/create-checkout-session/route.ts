// app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// Map your tiers to Stripe Price IDs
const PRICE_IDS: Record<string, string> = {
  "early-bird": "price_1Rtz0iGtFjZNBwkUekNWEm04", // $20
  regular: "price_1Rv1GUGtFjZNBwkUoWGnj6I1",       // $30
  "day-of": "price_1Rv1MGGtFjZNBwkUpLoYVKq6",      // $40
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const registrationType = String(body.registrationType || "regular");
    const price = PRICE_IDS[registrationType] || PRICE_IDS["regular"];

    // clamp quantity between 1 and 3
    const qty = Math.max(1, Math.min(3, Number(body.numberOfSpaces || 1)));

    // prefer env domain, else infer from request
    const origin =
      process.env.NEXT_PUBLIC_DOMAIN || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: qty }],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      // optional: include some metadata
      // metadata: { registrationType, numberOfSpaces: String(qty) },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Stripe checkout session creation failed." },
      { status: 500 }
    );
  }
}

// simple health check (helps when you curl GET)
export async function GET() {
  return NextResponse.json({ ok: true });
}
