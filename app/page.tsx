
// app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type TierKey = "early-bird" | "regular" | "day-of";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const scrollToRegistration = () => {
    const el = document.getElementById("registration");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validate textarea character limit
    const itemsDescription = (formData.get("itemsDescription") as string) || "";
    if (itemsDescription.length > 500) {
      setSubmitStatus("Items description must be 500 characters or less.");
      setLoading(false);
      return;
    }

    // Map UI selects to Stripe API payload
    const registrationType = (formData.get("registrationType") as TierKey) || "regular";
    const numberOfSpaces = Number((formData.get("numberOfSpaces") as string) || "1");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: registrationType, // "early-bird" | "regular" | "day-of"
          quantity: [1, 2, 3].includes(numberOfSpaces) ? numberOfSpaces : 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create session");
      if (!data?.url) throw new Error("No checkout URL returned");

      setSubmitStatus("Redirecting to payment…");
      window.location.href = data.url;
    } catch (err: any) {
      setSubmitStatus(`Payment setup failed: ${err?.message || String(err)}`);
      setLoading(false);
    }
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
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex flex-wrap gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-line w-6 h-6 flex items-center justify-center"></i>
                  <span>Saturday, September 13, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-time-line w-6 h-6 flex items-center justify-center"></i>
                  <span>9 AM - 3 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-line w-6 h-6 flex items-center justify-center"></i>
                  <span>Sandstone Park</span>
                </div>
              </div>
            </div>
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

      {/* Rules teaser (kept minimal to focus on registration section fidelity) */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Very First Community Yard Sale!</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The town of Lyons is buzzing with excitement as we prepare for our first Community Yard Sale!
          </p>
        </div>
      </section>

      {/* Registration Form (RESTORED STYLE) */}
      <section id="registration" className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">Register as a Vendor</h2>
            <p className="text-xl text-blue-100">Secure your spot at the Lyons Community Yard Sale!</p>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8">
            {submitStatus && (
              <div
                className={`${
                  submitStatus.toLowerCase().includes("failed")
                    ? "bg-red-50 text-red-700"
                    : submitStatus.toLowerCase().includes("redirecting")
                    ? "bg-blue-50 text-blue-700"
                    : "bg-green-50 text-green-700"
                } p-4 rounded-lg mb-6 text-center`}
              >
                {submitStatus}
              </div>
            )}

            <form id="vendor-registration" onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="123 Main St, Lyons, CO"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Type *</label>
                <select
                  name="registrationType"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                  defaultValue="regular"
                >
                  <option value="early-bird">Early Bird - $20 (First 20 vendors)</option>
                  <option value="regular">Regular - $30</option>
                  <option value="day-of">Day Of - $40</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Spaces</label>
                <select
                  name="numberOfSpaces"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                  defaultValue="1"
                >
                  <option value="1">1 Space (10x12 ft)</option>
                  <option value="2">2 Spaces (20x12 ft)</option>
                  <option value="3">3 Spaces (30x12 ft)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Items You'll Be Selling</label>
                <textarea
                  name="itemsDescription"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="Describe the types of items you plan to sell (max 500 characters)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="agreeToRules" required className="mt-1" />
                  <span className="text-sm text-gray-700">
                    I agree to follow all vendor rules and park regulations outlined above *
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="bringOwnSupplies" required className="mt-1" />
                  <span className="text-sm text-gray-700">
                    I understand that I need to bring my own tables, blankets, and supplies (no tents allowed) *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-4 rounded-lg text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Redirecting…" : "Continue to Payment"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join the Fun?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Let’s turn those "I might use this someday" items into cash and create a vibrant community atmosphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToRegistration}
              className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Register as Vendor
            </button>
            <Link
              href="/admin"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-500 px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              <div className="space-y-2 text-gray-300">
                <p>Saturday, September 13, 2025</p>
                <p>9:00 AM - 3:00 PM</p>
                <p>Sandstone Park</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={scrollToRegistration}
                  className="block text-left text-gray-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  Vendor Registration
                </button>
                <a href="#rules" className="block text-gray-300 hover:text-white transition-colors">
                  Rules &amp; Guidelines
                </a>
                <a href="#registration" className="block text-gray-300 hover:text-white transition-colors">
                  Pricing Information
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
                <i className="ri-heart-line w-6 h-6 flex items-center justify-center text-red-400"></i>
                Where Your Registration Fees Go
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <i className="ri-settings-line w-5 h-5 flex items-center justify-center text-blue-400"></i>
                    <span className="text-gray-300">Event administration costs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="ri-music-line w-5 h-5 flex items-center justify-center text-green-400"></i>
                    <span className="text-gray-300">Musicians performing at the event</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <i className="ri-calendar-event-line w-5 h-5 flex items-center justify-center text-orange-400"></i>
                    <span className="text-gray-300">Future town events</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="ri-graduation-cap-line w-5 h-5 flex items-center justify-center text-purple-400"></i>
                    <span className="text-gray-300">Lyons High School Theatre Department</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400">
            <p>&copy; 2025 Town of Lyons. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
