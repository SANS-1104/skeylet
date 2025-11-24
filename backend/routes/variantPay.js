// backend/routes/variantPay.js
import express from "express";
import axios from "axios"; // Ensure you have axios installed for backend API calls
import crypto from "crypto";

import User from "../models/User.js"; 
import Payment from "../models/Payment.js"; 
import Plan from "../models/Plan.js";

const router = express.Router();

// 1. VariantPay Configuration
const VARIANTPAY_API_ENDPOINT = process.env.VARIANTPAY_API_ENDPOINT || "https://payments.variantpay.com/cbs/ccs/initiate";
const VARIANTPAY_HEADERS = {
  'client-id': process.env.VARIANTPAY_CLIENT_ID,
  'fps3-api-key': process.env.VARIANTPAY_API_KEY,
  'client-secret': process.env.VARIANTPAY_CLIENT_SECRET,
  'service-secret': process.env.VARIANTPAY_SERVICE_SECRET,
  'accept': 'application/json',
  'content-type': 'application/json', // Required headers for VariantPay API [cite: 537]
};

// 1️⃣ Initiate Transaction (Replaces Razorpay's /create-order)
// This endpoint calls the VariantPay API to get a payment link.
router.post("/initiate-transaction", async (req, res) => {
  try {
    const { amount, clientReferenceId } = req.body; 
    
    // Note: clientReferenceId must be unique for every transaction (min 10, max 30 chars) [cite: 540]
    // The amount should be sent as a string and in the smallest unit (e.g., 10.00) if the API expects it.
    // The documentation shows transfer_amount as string, e.g., "10.00"[cite: 729].
    const payload = {
      reference_id: clientReferenceId, 
      from_account: process.env.VARIANTPAY_FROM_ACCOUNT, // Your VariantPay Account ID [cite: 727]
      transfer_amount: amount.toFixed(2), // Ensure amount is formatted as a string with 2 decimal places
      transfer_type: "1", // Fixed for Purchase Transaction (HPP) [cite: 701, 730]
      currency_code: "INR", // Fixed [cite: 728]
      purpose_message: "Purchase Transaction", 
    };

    const response = await axios.post(VARIANTPAY_API_ENDPOINT, payload, { 
        headers: VARIANTPAY_HEADERS,
        // Set a recommended timeout (e.g., 60 seconds) [cite: 660]
        timeout: 60000, 
    });

    const responseData = response.data;

    // Assuming the response is decrypted or unencrypted for the initiation step (Hosted Payment Page flow)
    // In a production setup, you may need to decrypt this response if using Direct API (Method B) [cite: 762]
    if (responseData.status === "SUCCESS" && responseData.responseCode === "PG00000") {
      
      const paymentLink = responseData.paymentLink?.linkUrl; // Extract the redirect URL [cite: 775]

      if (!paymentLink) {
         throw new Error("VariantPay initiation successful but no payment link returned.");
      }

      console.log("VariantPay Initiation SUCCESS:", responseData.sanTxnId);
      
      // Respond to the client with the link to redirect the customer
      res.json({
        success: true,
        sanTxnId: responseData.sanTxnId,
        redirectUrl: paymentLink,
        cTxnId: responseData.cTxnId
      });

    } else {
      console.error("VariantPay Initiation FAILED:", responseData);
      res.status(500).json({ 
        success: false, 
        message: responseData.message || "VariantPay initiation failed",
        errorCode: responseData.responseCode
      });
    }
  } catch (error) {
    // ❗ CRITICAL FIX: Log the actual error details from Axios response
    if (axios.isAxiosError(error) && error.response) {
      console.error("VariantPay API Error Response Status:", error.response.status);
      // This line will print the error message and code from the VariantPay API (e.g., E005)
      console.error("VariantPay API Error Response Data:", error.response.data); 
    } else {
      console.error("Initiate transaction non-Axios error:", error.message);
    }
    res.status(500).json({ message: "Error initiating VariantPay transaction. Check backend logs for E-Code." });
  }
});

// 2️⃣ Payment Callback (Replaces Razorpay's /verify-payment logic)
// This endpoint is the Webhook registered with VariantPay to receive final status.
router.post("/callback", async (req, res) => { // ❗ Make function async
  const callbackData = req.body; // Callback request will be sent in JSON format [cite: 419]
  console.log("VariantPay Callback Received:", callbackData);

  const { sanTxnId, status, responseCode, cTxnId, amount, bankReferenceNumber } = callbackData;

  // IMPORTANT: You must find the *initial* order data you stored before the redirect
  // using your unique reference ID, which is the cTxnId.
  // Assuming 'cTxnId' contains the necessary info or can retrieve the plan/user.
  // In a full application, you would query your temporary 'Order' or 'Pending Payment' collection here.

  // --- **SIMULATED SUBSCRIPTION UPDATE LOGIC** ---
  // Since we don't have the temporary order collection, we'll assume the cTxnId
  // is passed back from a successful initiation (Step 1) and we'll use a placeholder
  // to link it back to a user and plan.
  
  // 1. **Find the Initial Transaction (cTxnId)**
  // In a real app, you would query your DB for an order linked to cTxnId. 
  // For this example, we'll assume you retrieve the userId and planId successfully.
  const tempUserId = "USER_ID_FROM_DB"; // Placeholder: Replace with actual logic
  const tempPlanId = "PLAN_ID_FROM_DB"; // Placeholder: Replace with actual logic
  const tempBillingType = "yearly"; // Placeholder: Replace with actual logic
  const tempAmount = amount; // Use amount from callback for security

  if (!tempUserId || !tempPlanId) {
    console.error(`Callback: Cannot find order for cTxnId: ${cTxnId}`);
    return res.status(200).send("Order not found, acknowledged."); 
  }

  try {
      if (status === "SUCCESS" && responseCode === "PG00000") {
        // 2. **Process SUCCESS**
        console.log(`Payment SUCCESS for cTxnId: ${cTxnId}, sanTxnId: ${sanTxnId}`);
        
        const plan = await Plan.findById(tempPlanId);
        if (!plan) throw new Error("Plan not found");

        const oneYear = 365 * 24 * 60 * 60 * 1000;
        const validUntil = new Date(Date.now() + oneYear);

        // Record the payment
        await Payment.create({
            user: tempUserId,
            plan: tempPlanId,
            amount: tempAmount, 
            status: "active",
            method: "variantpay",
            PaymentId: sanTxnId,
            validUntil: validUntil,
            currency: "INR", 
        });

        // Update the User's subscription
        await User.findByIdAndUpdate(tempUserId, {
            subscriptionPlan: tempPlanId,
            subscriptionStatus: "active",
            nextBillingDate: validUntil,
            // The pre-save hook on User model handles setting monthlyQuota, usageCount
        });

      } else if (status === "FAILURE" && responseCode === "PG0000F") {
        // 2. **Process FAILURE**
        console.log(`Payment FAILURE for cTxnId: ${cTxnId}`);
        // Record payment as failed
        await Payment.create({
            user: tempUserId,
            plan: tempPlanId,
            amount: tempAmount,
            status: "failed",
            method: "variantpay",
            PaymentId: sanTxnId,
            currency: "INR", 
        });
      } else {
        console.warn(`Unusual status (${status}) received for cTxnId: ${cTxnId}`);
      }
  } catch (error) {
      console.error("Error processing VariantPay callback:", error);
      // In a real application, you would log this error and maybe notify an admin.
  }

  // Respond with 200 OK quickly to acknowledge receipt and prevent retries [cite: 602]
  res.status(200).send("OK");
});

export default router;