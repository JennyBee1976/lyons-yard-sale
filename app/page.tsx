
// app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

type TierKey = "early-bird" | "regular" | "day-of";

// Labels for tiers (matches your pricing cards)
const TIERS: { key: TierKey; label: string }[] = [
  { key: "early-bird", label: "Early Bird - $20 (First 20 vendors)" },
  { key: "regular", label: "Regular - $30" },
  { key: "day-of", label: "Day Of - $40" },
];

export default function Page() {
  const [tier, setTier] = useState<TierKey>("regular");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const canceled = params.get("canceled");

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create session");
      if (!data?.url) throw new Error("No checkout URL returned from API");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const scrollToRegistration = () => {
    const el = document.getElementById("registration");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)), url('https://static.readdy.ai/image/aecfd129164522ee2281fe35b304d57e/665aa6117a2b7ba1938f9e5baed8eb57.jfif')",
        }}
      >
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="text-white max-w-3xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">Lyons Community Yard Sale</h1>
            <p className="text-2xl mb-4 font-medium">A Day of Bargains and Community Spirit!</p>
            <div className="flex gap-4">
              <button
                onClick={scrollToRegistration}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Register as Vendor
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section with Stripe Checkout */}
      <section id="registration" className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-6 bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-6">Vendor Registration</h2>
          {canceled && (
            <p className="mb-4 rounded bg-yellow-50 p-3 text-yellow-800 text-center">
              Checkout canceled. You can try again below.
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-medium">Registration Type</span>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as TierKey)}
                className="w-full rounded border px-3 py-2"
              >
                {TIERS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">Number of Spaces</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded border px-3 py-2"
              >
                {[1, 2, 3].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-6 w-full rounded bg-black px-5 py-3 text-white disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Continue to Payment"}
          </button>

          {error && <p className="mt-3 text-red-600 text-center">{error}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2025 Town of Lyons. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
