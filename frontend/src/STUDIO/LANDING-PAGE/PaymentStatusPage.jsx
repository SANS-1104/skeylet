// frontend/src/STUDIO/PaymentStatusPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../LANDING-PAGE/ui/card";
import { Button } from "../LANDING-PAGE/ui/button";
import { CheckCircle, XCircle, AlertTriangle, LayoutDashboard } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../Navbar/AuthContext";

export function PaymentStatusPage() {
  const navigate = useNavigate();

  const [paymentStatus, setPaymentStatus] = useState("LOADING");
  const [verificationError, setVerificationError] = useState(null);

  const { profile, isLoggedIn } = useContext(AuthContext);
  const userName = profile?.name;

  // Your stored reference ID from create-payment API
  // const storedReferenceId = localStorage.getItem("variantPayReferenceId");
  const query = new URLSearchParams(window.location.search);
  const refFromURL = query.get("ref");

  const storedReferenceId = refFromURL || localStorage.getItem("variantPayReferenceId");

  // --------------- MAIN POLLING LOGIC ---------------
  useEffect(() => {
    if (!storedReferenceId) {
      setPaymentStatus("FAILED");
      setVerificationError("Missing internal reference ID.");
      toast.error("Missing payment reference. Cannot verify payment.");
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        const res = await axiosClient.get(`/payments/status/${storedReferenceId}`);

        if (!res.data) {
          setPaymentStatus("FAILED");
          toast.error("Invalid server response.");
          return;
        }

        const status = res.data.status?.toUpperCase();

        if (status === "ACTIVE" || status === "SUCCESS") {
          // Payment succeeded
          setPaymentStatus("SUCCESS");
          toast.success("Payment successful! Activating your plan...");

          localStorage.removeItem("variantPayReferenceId");
          localStorage.removeItem("selectedPlan");

          setTimeout(() => navigate("/payment-success", { replace: true }), 1500);
        } 
        else if (status === "FAILED") {
          setPaymentStatus("FAILED");
          toast.error("Payment failed.");
          localStorage.removeItem("variantPayReferenceId");
          setTimeout(() => navigate("/payment-failed", { replace: true }), 1500);
        }
        else {
          // Pending → Poll again
          setPaymentStatus("PENDING");
          setTimeout(pollPaymentStatus, 3000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setVerificationError("Error verifying payment.");
        setPaymentStatus("FAILED");
        setTimeout(() => navigate("/payment-failed", { replace: true }), 1500);
      }
    };

    pollPaymentStatus();
  }, [storedReferenceId, navigate]);

  // --------------- UI STATE CONTENT ---------------
  const getStatusContent = () => {
    let icon, title, message, color;
    const currentStatus = paymentStatus;

    switch (currentStatus) {
      case "SUCCESS":
        icon = <CheckCircle className="w-16 h-16 text-white" />;
        title = "Payment Successful!";
        message = "Your account has been upgraded.";
        color = "bg-gradient-to-r from-green-600 to-emerald-700";
        break;

      case "FAILED":
        icon = <XCircle className="w-16 h-16 text-white" />;
        title = "Payment Failed";
        message = verificationError || "Your payment could not be completed.";
        color = "bg-gradient-to-r from-red-600 to-pink-700";
        break;

      case "PENDING":
      case "LOADING":
      default:
        icon = <AlertTriangle className="w-16 h-16 text-white animate-spin" />;
        title = "Verifying Payment...";
        message = "Please wait while we confirm your transaction.";
        color = "bg-gradient-to-r from-amber-500 to-orange-600";
        break;
    }

    return { icon, title, message, color };
  };

  const { icon, title, message, color } = getStatusContent();

  // --------------- RENDER ---------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-0 shadow-2xl rounded-xl overflow-hidden">
        
        <div className={`p-10 text-center ${color}`}>
          <div className="flex justify-center mb-4">{icon}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        </div>

        <CardContent className="p-8 text-center space-y-6">
          <p className="text-gray-600 text-lg">{message}</p>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Button
              size="lg"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold transition-all duration-300"
              onClick={() => {
                const dashboardPath = userName ? `/dashboard/${userName}` : (isLoggedIn ? "/dashboard" : "/");
                navigate(dashboardPath);
              }}
              disabled={paymentStatus === "LOADING" || paymentStatus === "PENDING"}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>

            {paymentStatus === "FAILED" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/checkout")}
              >
                Try Payment Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
