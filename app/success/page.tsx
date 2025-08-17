
// app/success/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
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

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className=\"mx-auto max-w-3xl p-6\"><p>Loading...</p></main>}>
      <SuccessInner />
    </Suspense>
  );
}
