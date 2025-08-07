// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';        // required for stripe SDK
export const dynamic = 'force-dynamic'; // avoid caching
export const revalidate = 0;

const secret = process.env.STRIPE_SECRET_KEY as string;
if (!secret) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}
const stripe = new Stripe(secret);

export async function GET() {
  // simple health check for curl
  return NextResponse.json({ ok: true });
}

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 1000, // $10
            product_data: { name: 'Yard Sale Booth Reservation' },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Stripe checkout session creation failed.' },
      { status: 500 }
    );
  }
}
