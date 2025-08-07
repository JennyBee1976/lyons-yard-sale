// app/page.tsx
'use client';

export default function Home() {
  const goPay = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else alert('Stripe checkout session failed.');
    } catch (e) {
      console.error(e);
      alert('Payment setup failed.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Lyons Community Yard Sale</h1>
      <p>Test the Stripe redirect works first, then we’ll restore the full page.</p>
      <button
        onClick={goPay}
        className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Continue to Payment
      </button>
    </main>
  );
}
