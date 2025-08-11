// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Map your registration types to Stripe Price IDs
const PRICE_BY_TIER: Record<string, string> = {
  'early-bird': 'price_1Rtz0iGtFjZNBwkUekNWEm04', // $20
  'regular':    'price_1Rv1GUGtFjZNBwkUoWGnj6I1', // $30
  'day-of':     'price_1Rv1MGGtFjZNBwkUpLoYVKq6', // $40
};

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const { registrationType, numberOfSpaces } = await req.json();

    const priceId = PRICE_BY_TIER[registrationType];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid registrationType' }, { status: 400 });
    }

    const qtyRaw = Number(numberOfSpaces) || 1;
    const quantity = Math.max(1, Math.min(3, Math.floor(qtyRaw)));

    // Prefer env; fall back to request origin
    const origin =
      process.env.NEXT_PUBLIC_DOMAIN ||
      new URL(req.headers.get('origin') || 'https://lyons-yard-sale.vercel.app').origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity }],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Stripe checkout session creation failed.' },
      { status: 500 }
    );
  }
}
