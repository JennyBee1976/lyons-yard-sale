import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Simple ping so we can test with GET
export async function GET(req: Request) {
  return NextResponse.json({ ok: true, method: "GET" }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const origin =
      process.env.NEXT_PUBLIC_DOMAIN || new URL(req.url).origin;

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
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Stripe checkout session creation failed." },
      { status: 500 }
    );
  }
}
