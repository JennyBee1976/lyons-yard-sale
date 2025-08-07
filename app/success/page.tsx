export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">🎉 You're Booked!</h1>
        <p className="text-gray-700 mb-6">
          Your vendor registration has been successfully completed. Thank you for being part of the Lyons Community Yard Sale!
        </p>
        <a
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
