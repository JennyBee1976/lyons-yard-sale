// app/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [submitStatus, setSubmitStatus] = useState('');

  const scrollToRegistration = () => {
    const el = document.getElementById('registration');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // sends the nicely formatted form data to your Readdy endpoint
  const submitFormData = async (formData: FormData) => {
    const res = await fetch('https://readdy.ai/api/form/d26n70qelq606pbtooeg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString(),
    });
    if (!res.ok) throw new Error('Form submission failed');
    return res.text();
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // textarea length guard
    const itemsDescription = (formData.get('itemsDescription') as string) || '';
    if (itemsDescription.length > 500) {
      setSubmitStatus('Items description must be 500 characters or less.');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    const data = Object.fromEntries(formData.entries());

    // pricing calc
    const prices: Record<string, number> = { 'early-bird': 20, regular: 30, 'day-of': 40 };
    const basePrice = prices[data.registrationType as string] ?? 30;
    const numberOfSpaces = parseInt((data.numberOfSpaces as string) || '1', 10);
    const totalAmount = basePrice * numberOfSpaces;

    // build processed payload for Readdy
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
    processed.append('registrationType', registrationTypeLabels[data.registrationType as string] || (data.registrationType as string));

    const spacesLabels: Record<string, string> = {
      '1': '1 Space (10x12 ft)',
      '2': '2 Spaces (20x12 ft)',
      '3': '3 Spaces (30x12 ft)',
    };
    processed.append('numberOfSpaces', spacesLabels[data.numberOfSpaces as string] || (data.numberOfSpaces as string));

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

    // 🔁 hosted Stripe Checkout redirect
    setSubmitStatus('Redirecting to payment...');
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
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

      {/* Hero */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage:
            `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)), url('https://static.readdy.ai/image/aecfd129164522ee2281fe35b304d57e/665aa6117a2b7ba1938f9e5baed8eb57.jfif')`,
        }}
      >
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="text-white max-w-3xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">Lyons Community Yard Sale</h1>
            <p className="text-2xl mb-4 font-medium">A Day of Bargains and Community Spirit!</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex flex-wrap gap-6 text-lg">
                <div className="flex items-center gap-2"><i className="ri-calendar-line w-6 h-6"></i><span>Saturday, September 13, 2025</span></div>
                <div className="flex items-center gap-2"><i className="ri-time-line w-6 h-6"></i><span>9 AM - 3 PM</span></div>
                <div className="flex items-center gap-2"><i className="ri-map-pin-line w-6 h-6"></i><span>Sandstone Park</span></div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={scrollToRegistration} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors">Register as Vendor</button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-colors">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Very First Community Yard Sale!</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The town of Lyons is buzzing with excitement as we prepare for our first Community Yard Sale! This isn’t just any yard sale—this is a chance to dig through those closets, dust off those treasures, and find new homes for items that have been patiently waiting for their moment to shine.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://readdy.ai/api/search-image?query=outdoor%20yard%20sale%20display%20with%20vintage%20furniture%20wooden%20chairs%20antique%20dresser%20lawnmower%20kitchen%20dishes%20colorful%20plates%20bowls%20home%20decor%20items%20picture%20frames%20vintage%20lamps%20spread%20on%20tables%20and%20blankets%20sunny%20day%20neighborhood%20yard%20sale%20atmosphere%20realistic%20detailed&width=600&height=400&seq=about2&orientation=landscape"
                alt="Community yard sale atmosphere"
                className="rounded-lg shadow-lg object-cover w-full h-80"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-treasure-map-line w-6 h-6 text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Hidden Treasures</h3>
                  <p className="text-gray-600">Discover unique items and vintage finds from your neighbors’ collections.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-community-line w-6 h-6 text-green-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Community</h3>
                  <p className="text-gray-600">Connect with neighbors and strengthen our community bonds.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-money-dollar-circle-line w-6 h-6 text-orange-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Turn Clutter to Cash</h3>
                  <p className="text-gray-600">Transform those "someday" items into immediate cash benefits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Want to Sell? Here’s What You Need to Know!</h2>
            <p className="text-xl text-gray-600">Join as a vendor and turn your treasures into cash</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-price-tag-3-line w-8 h-8 text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold text-green-700">Early Bird (First 20)</span>
                  <span className="text-2xl font-bold text-green-600">$20</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-blue-700">Regular Pricing</span>
                  <span className="text-2xl font-bold text-blue-600">$30</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-semibold text-orange-700">Day Of Registration</span>
                  <span className="text-2xl font-bold text-orange-600">$40</span>
                </div>
              </div>
            </div>

            {/* Setup */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-time-line w-8 h-8 text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Setup Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><i className="ri-arrow-right-line w-5 h-5 text-green-600 mt-1"></i><div><p className="font-semibold text-gray-900">Setup Time</p><p className="text-gray-600">Arrive as early as 7 AM</p></div></div>
                <div className="flex items-start gap-3"><i className="ri-arrow-right-line w-5 h-5 text-green-600 mt-1"></i><div><p className="font-semibold text-gray-900">Tear Down</p><p className="text-gray-600">Must clear out by 4:30 PM</p></div></div>
                <div className="flex items-start gap-3"><i className="ri-arrow-right-line w-5 h-5 text-green-600 mt-1"></i><div><p className="font-semibold text-gray-900">Space Size</p><p className="text-gray-600">10x12 feet per vendor</p></div></div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-list-3-line w-8 h-8 text-orange-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Registration</h3>
              <div className="text-center">
                <p className="text-gray-600 mb-6">Secure your vendor spot today and join our community event!</p>
                <button onClick={scrollToRegistration} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors w-full">Register Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Rules to Keep Us All Happy</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-blue-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <i className="ri-store-3-line w-8 h-8"></i> Vendor Rules
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><i className="ri-checkbox-circle-line w-6 h-6 text-blue-600 mt-0.5"></i><span className="text-gray-700">Check in at registration table before setting up to get your space number</span></li>
                <li className="flex items-start gap-3"><i className="ri-close-circle-line w-6 h-6 text-red-500 mt-0.5"></i><span className="text-gray-700">No park trash or recycling disposal</span></li>
                <li className="flex items-start gap-3"><i className="ri-close-circle-line w-6 h-6 text-red-500 mt-0.5"></i><span className="text-gray-700">No glass, alcohol, or pets allowed</span></li>
                <li className="flex items-start gap-3"><i className="ri-close-circle-line w-6 h-6 text-red-500 mt-0.5"></i><span className="text-gray-700">No tents allowed - bring your own tables and blankets</span></li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3">
                <i className="ri-leaf-line w-8 h-8"></i> Park Rules
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><i className="ri-close-circle-line w-6 h-6 text-red-500 mt-0.5"></i><span className="text-gray-700">No amplified music or stages</span></li>
                <li className="flex items-start gap-3"><i className="ri-heart-line w-6 h-6 text-green-600 mt-0.5"></i><span className="text-gray-700">Keep the atmosphere peaceful and friendly</span></li>
                <li className="flex items-start gap-3"><i className="ri-close-circle-line w-6 h-6 text-red-500 mt-0.5"></i><span className="text-gray-700">No glass, alcohol, or pets on premises</span></li>
                <li className="flex items-start gap-3"><i className="ri-shield-check-line w-6 h-6 text-green-600 mt-0.5"></i><span className="text-gray-700">Follow all park regulations for everyone’s safety</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="registration" className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">Register as a Vendor</h2>
            <p className="text-xl text-blue-100">Secure your spot at the Lyons Community Yard Sale!</p>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8">
            {submitStatus && (
              <div className={`${submitStatus.includes('successful') ? 'bg-green-50 text-green-700' : submitStatus.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} p-4 rounded-lg mb-6 text-center`}>
                {submitStatus}
              </div>
            )}

            <form id="vendor-registration" onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="fullName" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input type="email" name="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="your.email@example.com" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <input type="text" name="address" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="123 Main St, Lyons, CO" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Type *</label>
                <select name="registrationType" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8">
                  <option value="">Select registration type</option>
                  <option value="early-bird">Early Bird - $20 (First 20 vendors)</option>
                  <option value="regular">Regular - $30</option>
                  <option value="day-of">Day Of - $40</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Spaces</label>
                <select name="numberOfSpaces" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8">
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
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="agreeToRules" required className="mt-1" />
                  <span className="text-sm text-gray-700">I agree to follow all vendor rules and park regulations outlined above *</span>
                </label>
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input type="checkbox"
