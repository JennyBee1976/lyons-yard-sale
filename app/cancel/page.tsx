export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Cancelled</h1>
        <p className="text-gray-700 mb-6">
          Your payment was cancelled or did not complete. If this was a mistake, you can try registering again.
        </p>
        <a
          href="/#registration"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Return to Registration
        </a>
      </div>
    </div>
  );
}
