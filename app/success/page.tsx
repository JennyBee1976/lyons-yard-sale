// app/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Payment successful 🎉</h1>
      <p className="mt-2">Thanks for registering! Your Stripe session id: {sessionId}</p>
      <a href="/" className="mt-4 inline-block underline">
        Go back home
      </a>
    </main>
  );
}
