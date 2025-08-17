// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Read env once
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, ""); // trim trailing slash

const PRICE_MAP = {
  basic: process.env.STRIPE_PRICE_ID_BASIC,
  premium: process.env.STRIPE_PRICE_ID_PREMIUM,
  vip: process.env.STRIPE_PRICE_ID_VIP,
} as const;

function assertEnv() {
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.NEXT_PUBLIC_SITE_URL) missing.push("NEXT_PUBLIC_SITE_URL");
  (["basic", "premium", "vip"] as const).forEach((k) => {
    if (!PRICE_MAP[k]) missing.push(`STRIPE_PRICE_ID_${k.toUpperCase()}`);
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

    // Validate tier
    if (!tier || !PRICE_MAP[tier as keyof typeof PRICE_MAP]) {
      return NextResponse.json(
        { error: "Invalid or missing 'tier'. Must be one of: basic, premium, vip." },
        { status: 400 }
      );
    }

    // Validate quantity (1–3)
    const qtyNum = Number(quantity);
    const qty = [1, 2, 3].includes(qtyNum) ? qtyNum : 1;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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
