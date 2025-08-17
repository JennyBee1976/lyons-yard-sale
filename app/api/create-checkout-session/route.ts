
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2022-11-15" }) : null;

const PRICE_IDS = {
  "early-bird": "price_1RvkViGXgSGc7Z9QjmDEcl1G",
  "regular": "price_1RvkWSGXgSGc7Z9QU2vg8Ahp",
  "day-of": "price_1RvkX7GXgSGc7Z9QVwdlMF84",
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
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const msg = err?.raw?.message || err?.message || "Failed to create checkout session";
    console.error("checkout error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
