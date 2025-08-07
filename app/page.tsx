// app/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [submitStatus, setSubmitStatus] = useState('');

  const scrollToRegistration = () => {
    document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
  };

  async function submitFormData(formData: FormData) {
    const res = await fetch('https://readdy.ai/api/form/d26n70qelq606pbtooeg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString(),
    });
    if (!res.ok) throw new Error('Form submission failed');
    return res.text();
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const itemsDescription = (formData.get('itemsDescription') as string) || '';
    if (itemsDescription.length > 500) {
      setSubmitStatus('Items description must be 500 characters or less.');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    const data = Object.fromEntries(formData.entries());
    const prices: Record<string, number> = { 'early-bird': 20, regular: 30, 'day-of': 40 };
    const basePrice = prices[data.registrationType as string] ?? 30;
    const numberOfSpaces = parseInt((data.numberOfSpaces as string) || '1', 10);
    const totalAmount = basePrice * numberOfSpaces;

    const processed = new FormData();
    processed.append('fullName', (data.fullName as string) || '');
    processed.append('phone', (data.phone as string) || '');
    processed.append('email', (data.email as string) || '');
    processed.append('address', (data.address as string) || '');

    const registrationTypeLabels: Record<string, string> = {
      'early-bird': 'Early Bird - $20 (First 20 vendors)',
      regular: 'Regular - $30',
      'day-of': 'Day Of - $40',
    };
    processed.append(
      'registrationType',
      registrationTypeLabels[data.registrationType as string] || (data.registrationType as string)
    );

    const spacesLabels: Record<string, string> = {
      '1': '1 Space (10x12 ft)',
      '2': '2 Spaces (20x12 ft)',
      '3': '3 Spaces (30x12 ft)',
    };
    processed.append(
      'numberOfSpaces',
      spacesLabels[data.numberOfSpaces as string] || (data.numberOfSpaces as string)
    );

    processed.append('itemsDescription', itemsDescription);

    if (data.agreeToRules === 'on') processed.append('agreeToRules', 'Agreed to follow all vendor rules and park regulations');
    if (data.bringOwnSupplies === 'on') processed.append('bringOwnSupplies', 'Understands to bring own tables, blankets, and supplies');

    processed.append('basePrice', `$${basePrice}`);
    processed.append('totalAmount', `$${totalAmount}`);

    setSubmitStatus('Submitting registration...');
    try {
      await submitFormData(processed);
    } catch {
      setSubmitStatus('Form submission failed. Please try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setSubmitStatus('Redirecting to payment...');
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else {
        setSubmitStatus('Stripe checkout session failed.');
        setTimeout(() => setSubmitStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('Payment setup failed. Try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Minimal hero */}
      <section className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold mb-2">Lyons Community Yard Sale</h1>
          <p className="text-gray-600 mb-6">Saturday, September 13, 2025 • 9 AM – 3 PM • Sandstone Park</p>
          <button
            onClick={scrollToRegistration}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Register as Vendor
          </button>
        </div>
      </section>

      {/* Registration Form */}
      <section id="registration" className="py-12">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Register as a Vendor</h2>

          {submitStatus && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4 text-center">{submitStatus}</div>
          )}

          <form id="vendor-registration" onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input name="fullName" required className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                <input name="phone" required className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email Address *</label>
              <input type="email" name="email" required className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Address *</label>
              <input name="address" required className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Registration Type *</label>
              <select name="registrationType" required className="w-full px-3 py-2 border rounded">
                <option value="">Select registration type</option>
                <option value="early-bird">Early Bird - $20 (First 20 vendors)</option>
                <option value="regular">Regular - $30</option>
                <option value="day-of">Day Of - $40</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Number of Spaces</label>
              <select name="numberOfSpaces" className="w-full px-3 py-2 border rounded">
                <option value="1">1 Space (10x12 ft)</option>
                <option value="2">2 Spaces (20x12 ft)</option>
                <option value="3">3 Spaces (30x12 ft)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Items You'll Be Selling</label>
              <textarea
                name="itemsDescription"
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border rounded"
                placeholder="Describe items (max 500 chars)"
              />
            </div>

            <label className="flex items-start gap-2">
              <input type="checkbox" name="agreeToRules" required className="mt-1" />
              <span className="text-sm">I agree to follow all vendor rules and park regulations *</span>
            </label>

            <label className="flex items-start gap-2">
              <input type="checkbox" name="bringOwnSupplies" required className="mt-1" />
              <span className="text-sm">I will bring my own tables/blankets (no tents) *</span>
            </label>

            <button
              type="submit"
              disabled={!!submitStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold disabled:opacity-50"
            >
              {submitStatus ? 'Processing…' : 'Continue to Payment'}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/admin" className="text-blue-600 hover:underline">Admin Dashboard</Link>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 py-8">
        © 2025 Town of Lyons. All rights reserved.
      </footer>
    </div>
  );
}
