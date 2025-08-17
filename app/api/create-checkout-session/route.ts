// app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY; // must be LIVE when you want live charges
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2025-07-30.basil" }) : null;

// LIVE price IDs you gave me
const PRICE_IDS = {
  "early-bird": "price_1Rtz0iGtFjZNBwkUekNWEm04", // $20
  "regular":    "price_1Rv1GUGtFjZNBwkUoWGnj6I1", // $30
  "day-of":     "price_1Rv1MGGtFjZNBwkUpLoYVKq6", // $40
} as const;

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY (set LIVE key in Vercel)." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const registrationType = String(body.registrationType || "");
    const price = (PRICE_IDS as any)[registrationType];

    if (!price) {
      return NextResponse.json(
        { error: `Unknown registrationType "${registrationType}".` },
        { status: 400 }
      );
    }

    const qtyRaw = Number(body.numberOfSpaces);
    const qty = Math.max(1, Math.min(3, Number.isFinite(qtyRaw) ? qtyRaw : 1));

    const origin = process.env.NEXT_PUBLIC_DOMAIN || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: qty }],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      automatic_tax: { enabled: false },
      // metadata: { registrationType, numberOfSpaces: String(qty) }, // optional
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // Surface Stripe’s message if present
    const msg = err?.raw?.message || err?.message || "Failed to create checkout session";
    console.error("checkout error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// simple ping for GET (handy for curl tests)
export async function GET() {
  return NextResponse.json({ ok: true });
}
