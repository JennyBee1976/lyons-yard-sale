
// app/success/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session_id"));
    }
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Payment successful 🎉</h1>
      <p className="mt-2">
        Thanks for registering!
        {sessionId ? <> Your Stripe session id: {sessionId}</> : null}
      </p>
      <a href="/" className="mt-4 inline-block underline">
        Go back home
      </a>
    </main>
  );
}
