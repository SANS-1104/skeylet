import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../LANDING-PAGE/ui/card";
import { Button } from "../LANDING-PAGE/ui/button";
import { CheckCircle, XCircle, AlertTriangle, LayoutDashboard } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../Navbar/AuthContext"; // Assuming AuthContext provides user info

/**
 * Renders the final status page after the user is redirected from the VariantPay gateway.
 * It reads status from URL params and performs a final backend verification check.
 */
export function PaymentStatusPage() {
  // Hook to read URL parameters (?status=...&sanTxnId=...)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlStatus = searchParams.get("status") || "PENDING";
  const sanTxnId = searchParams.get("sanTxnId");
  
  // State for the definitive status after backend verification
  const [paymentStatus, setPaymentStatus] = useState("LOADING"); 
  const [verificationError, setVerificationError] = useState(null);

  // Get user info for dashboard redirect path
  const { profile, isLoggedIn } = useContext(AuthContext);
  const userName = profile?.name;
  const storedReferenceId = localStorage.getItem("variantPayReferenceId");

  useEffect(() => {
    if (!sanTxnId || !storedReferenceId) {
      setPaymentStatus("FAILED"); //
      setVerificationError("Missing transaction ID or internal reference ID."); //
      toast.error("Could not verify payment due to missing identifiers."); //
      return;
    }
    // --- Backend Verification (Crucial for Security) ---
    // This call checks the database to confirm the server-to-server webhook (LEG 3) 
    // was received, ensuring the payment is truly confirmed and the subscription is active.
    const verifyStatus = async () => {
      try {
        setPaymentStatus("VERIFYING");

        // This is a placeholder for the final verification endpoint 
        const res = await axiosClient.post("/payments/callback", { 
          sanTxnId,
          referenceId: storedReferenceId,
        });

        const finalStatus = res.data.status.toUpperCase();
        setPaymentStatus(finalStatus);

        if (finalStatus === "SUCCESS") {
           toast.success("Payment confirmed! Your plan is now active. Redirecting to home...", { autoClose: 3000 });
           // 🚀 NEW: Auto-redirect to the homepage as requested
           localStorage.removeItem("selectedPlan");
           localStorage.removeItem("variantPayReferenceId");
           setTimeout(() => {
               navigate("/", { replace: true }); 
           }, 2000); // Give the user time to see the success toast
        } else if (finalStatus === "FAILED" || finalStatus === "CANCELLED") {
           toast.error("Payment was not successful.");
           localStorage.removeItem("variantPayReferenceId");
        }

      } catch (err) {
        console.error("Verification failed:", err);
        // Fallback: If verification API fails, use the URL status as a temporary display
        localStorage.removeItem("variantPayReferenceId");
        setPaymentStatus(urlStatus.toUpperCase() === "SUCCESS" ? "SUCCESS" : "FAILED"); 
        setVerificationError(err.response?.data?.message || "Could not complete final verification.");
        toast.error("An error occurred during payment verification.");
      }
    };
    
    verifyStatus();
    
  }, [sanTxnId, urlStatus, storedReferenceId]);

  
  const getStatusContent = () => {
    let icon, title, message, color;

    const currentStatus = paymentStatus === "VERIFYING" ? "LOADING" : paymentStatus;
    
    switch (currentStatus) {
      case "SUCCESS":
        icon = <CheckCircle className="w-16 h-16 text-white" />;
        title = "Payment Successful!";
        message = "Your account has been upgraded. Thank you for your purchase!";
        color = "bg-gradient-to-r from-green-600 to-emerald-700";
        break;
      case "FAILED":
      case "CANCELLED":
        icon = <XCircle className="w-16 h-16 text-white" />;
        title = "Payment Failed";
        message = "The transaction could not be completed. Please try again or contact support.";
        color = "bg-gradient-to-r from-red-600 to-pink-700";
        break;
      case "LOADING":
      case "VERIFYING":
      case "PENDING":
        // Use the initial URL status as a hint if verification is taking time
        const loadingMessage = urlStatus.toUpperCase() === "SUCCESS" 
            ? "Verifying final status..." 
            : "Checking transaction status...";
            
        icon = <AlertTriangle className="w-16 h-16 text-white animate-spin" />;
        title = "Processing Payment...";
        message = loadingMessage + " Please wait a moment.";
        color = "bg-gradient-to-r from-amber-500 to-orange-600";
        break;
      default:
        icon = <AlertTriangle className="w-16 h-16 text-white" />;
        title = "Status Unknown";
        message = verificationError || "We could not determine the final status. Please check your dashboard later.";
        color = "bg-gradient-to-r from-gray-500 to-slate-600";
        break;
    }

    return { icon, title, message, color };
  };

  const { icon, title, message, color } = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-0 shadow-2xl rounded-xl overflow-hidden">
        
        {/* Header/Banner */}
        <div className={`p-10 text-center ${color}`}>
          <div className="flex justify-center mb-4">
             {icon}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        </div>

        <CardContent className="p-8 text-center space-y-6">
          
          <p className="text-gray-600 text-lg">
            {message}
          </p>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Button
              size="lg"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold transition-all duration-300"
              onClick={() => {
                const dashboardPath = userName ? `/dashboard/${userName}` : (isLoggedIn ? "/dashboard" : "/");
                navigate(dashboardPath);
              }}
              disabled={paymentStatus === "LOADING" || paymentStatus === "VERIFYING"}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
            
            {paymentStatus === "FAILED" && (
                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/checkout")} // Redirect back to checkout or pricing
                >
                    Try Payment Again
                </Button>
            )}

            <p className="text-sm text-muted-foreground pt-2">
                Transaction ID: {sanTxnId || "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}