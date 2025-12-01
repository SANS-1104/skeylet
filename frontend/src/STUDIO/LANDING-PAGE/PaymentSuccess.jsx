import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  useEffect(() => {
    document.title = "Payment Successful – Skeylet";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-green-700">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mt-2">
          Your subscription has been activated successfully.
        </p>

        <a
          href="/dashboard"
          className="mt-6 inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
