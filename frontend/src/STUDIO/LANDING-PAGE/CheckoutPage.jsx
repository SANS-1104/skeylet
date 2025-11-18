import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../Navbar/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isLoggedIn, profile  } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please log in first!", { autoClose: 1500 });
      navigate("/auth");
      return;
    }

    const selectedPlan = JSON.parse(localStorage.getItem("selectedPlan"));
    if (!selectedPlan) {
      toast.error("No plan selected", { autoClose: 1500 });
      navigate("/");
      return;
    }
    setPlan(selectedPlan);
  }, [isLoggedIn, navigate]);

  const handlePayment = async () => {
    if (!plan) {
      toast.error("Plan is missing");
    };

    const currentPlan = plan;
    const currentUser = profile;
    if (!currentUser?._id) {
      toast.error("User profile not loaded yet", { autoClose: 2000 });
      return;
    }

    try {
      // 1️⃣ Create order from backend
      const { data: order } = await axiosClient.post("/payments/create-order", {
        amount: plan.selectedPrice,
      });
      // 2️⃣ Razorpay options


      
      const keyRes = await axiosClient.get("/payments/key");
      const razorpayKey = keyRes.data.key;


      const options = {
        // key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "LinkedIn Post Scheduler",
        description: `Subscription: ${currentPlan.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Use captured user
            // Correct: send only required fields
            const verifyRes = await axiosClient.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });


            if (verifyRes.data.success) {
              await axiosClient.post("/plans/subscribe", {
                userId: currentUser._id,
                planId: currentPlan._id,
                billingType: currentPlan.billingType,
                price: currentPlan.selectedPrice,
                paymentStatus: "success",
              });

              localStorage.removeItem("selectedPlan");
              toast.success("Payment successful! Redirecting to dashboard...", { autoClose: 1500 });
              navigate(`/dashboard/${currentUser.name}`);
            } else {
              toast.error("Payment verification failed", { autoClose: 2000 });
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed", { autoClose: 2000 });
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: { color: "#528FF0" },
      };
      // 5️⃣ Open Razorpay popup
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment", { autoClose: 1500 });
    }
  };

  if (!plan) return null;
  const region = navigator.language === "en-IN" ? "IN" : "US";

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600 text-lg">
            You're one step away from automating your LinkedIn posts!
          </p>
        </div>

        {/* Plan Card */}
        <div className="border rounded-xl shadow-md p-6 mb-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {plan.name.replace(/\b\w/g, (c) => c.toUpperCase())}
            </h2>
            <span className="text-gray-600 text-sm uppercase font-medium">
              {plan.billingType}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-gray-900">
              {formatCurrency(plan.selectedPrice, region)}
            </span>
            <span className="text-gray-600">{plan.billingType === "yearly" ? "/year" : "/month"}</span>
          </div>
          {plan.features && plan.features.length > 0 && (
            <ul className="mb-4 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold transition-all duration-300"
        >
          Proceed to Pay
        </Button>

        {/* Disclaimer */}
        <p className="text-sm text-gray-500 text-center mt-4">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
