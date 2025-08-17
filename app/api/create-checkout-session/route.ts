
// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");

// Map registration tiers to price IDs in env vars
const PRICE_MAP = {
  "early-bird": process.env.STRIPE_PRICE_ID_EARLY_BIRD,
  "regular": process.env.STRIPE_PRICE_ID_REGULAR,
  "day-of": process.env.STRIPE_PRICE_ID_DAY_OF,
} as const;

function assertEnv() {
  const missing: string[] = [];
  if (!stripeSecret) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.NEXT_PUBLIC_SITE_URL) missing.push("NEXT_PUBLIC_SITE_URL");
  (["early-bird", "regular", "day-of"] as const).forEach((k) => {
    if (!PRICE_MAP[k]) missing.push(`STRIPE_PRICE_ID_${k.replace("-", "_").toUpperCase()}`);
  });
  return missing;
}

export async function POST(req: NextRequest) {
  try {
    const missing = assertEnv();
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing env vars: ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    const { tier, quantity } = await req.json();

    if (!tier || !PRICE_MAP[tier as keyof typeof PRICE_MAP]) {
      return NextResponse.json(
        { error: "Invalid or missing 'tier'. Must be one of: early-bird, regular, day-of." },
        { status: 400 }
      );
    }

    const qtyNum = Number(quantity);
    const qty = [1, 2, 3].includes(qtyNum) ? qtyNum : 1;

    const stripe = new Stripe(stripeSecret!);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_MAP[tier as keyof typeof PRICE_MAP]!, quantity: qty }],
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?canceled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
