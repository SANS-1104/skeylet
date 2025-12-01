import { useEffect } from "react";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  useEffect(() => {
    document.title = "Payment Failed – Skeylet";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg text-center">
        <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-red-700">
          Payment Failed
        </h1>

        <p className="text-gray-600 mt-2">
          Unfortunately, your payment could not be completed.
          <br />Please try again or use another payment method.
        </p>

        <a
          href="/pricing"
          className="mt-6 inline-block bg-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
