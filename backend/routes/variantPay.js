JavaScript

// file: backend/routes/variantPay.js
import express from "express";
import axios from "axios";
import crypto from "crypto";

import User from "../models/User.js"; 
import Payment from "../models/Payment.js"; 
import Plan from "../models/Plan.js";

const router = express.Router();

[cite_start]// Production API endpoint from documentation [cite: 4]
const VARIANTPAY_API_ENDPOINT = process.env.VARIANTPAY_API_ENDPOINT || "https://payments.variantpay.com/cbs/uni/initiate";
const VARIANTPAY_HEADERS = {
  'client-id': process.env.VARIANTPAY_CLIENT_ID,
  'fps3-api-key': process.env.VARIANTPAY_API_KEY,
  'client-secret': process.env.VARIANTPAY_CLIENT_SECRET,
  'service-secret': process.env.VARIANTPAY_SERVICE_SECRET,
  'accept': 'application/json',
  'content-type': 'application/json',
};

router.post("/initiate-transaction", async (req, res) => {
  try {
    // ❗ FIX: Destructure userDetails along with other fields
    const { amount, clientReferenceId, userDetails } = req.body; 

    // Construct the payload
    const payload = {
      reference_id: clientReferenceId, 
      from_account: process.env.VARIANTPAY_FROM_ACCOUNT, 
      transfer_amount: amount.toFixed(2), 
      transfer_type: "1", // Assuming '1' is the Purchase/HPP code
      currency_code: "INR", 
      purpose_message: "Purchase Transaction", 
      
      // ❗ FIX: Use destructured userDetails
      beneficiary_name: userDetails?.name, 
      sender_mobile: userDetails?.mobile,
      beneficiary_mobile: userDetails?.mobile, // Often required for Pay-in/HPP
    };

    const response = await axios.post(VARIANTPAY_API_ENDPOINT, payload, { 
        headers: VARIANTPAY_HEADERS,
        timeout: 60000, 
    });

    const responseData = response.data;
    if (responseData.status === "SUCCESS" && responseData.responseCode === "PG00000") {
      
      const paymentLink = responseData.paymentLink?.linkUrl; 

      if (!paymentLink) {
         throw new Error("VariantPay initiation successful but no payment link returned.");
      }

      console.log("VariantPay Initiation SUCCESS:", responseData.sanTxnId);
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
    if (axios.isAxiosError(error) && error.response) {
      console.error("VariantPay API Error Response Status:", error.response.status);
      console.error("VariantPay API Error Response Data:", error.response.data); 
    } else {
      console.error("Initiate transaction non-Axios error:", error.message);
    }
    res.status(500).json({ message: "Error initiating VariantPay transaction. Check backend logs for E-Code." });
  }
});

router.post("/callback", async (req, res) => { 
  const callbackData = req.body; 
  console.log("VariantPay Callback Received:", callbackData);

  const { sanTxnId, status, responseCode, cTxnId, amount, bankReferenceNumber } = callbackData;
  const tempUserId = "USER_ID_FROM_DB"; 
  const tempPlanId = "PLAN_ID_FROM_DB"; 
  const tempBillingType = "yearly"; 
  const tempAmount = amount; 

  if (!tempUserId || !tempPlanId) {
    console.error(`Callback: Cannot find order for cTxnId: ${cTxnId}`);
    return res.status(200).send("Order not found, acknowledged."); 
  }

  try {
      if (status === "SUCCESS" && responseCode === "PG00000") {
        console.log(`Payment SUCCESS for cTxnId: ${cTxnId}, sanTxnId: ${sanTxnId}`);
        
        const plan = await Plan.findById(tempPlanId);
        if (!plan) throw new Error("Plan not found");

        const oneYear = 365 * 24 * 60 * 60 * 1000;
        const validUntil = new Date(Date.now() + oneYear);

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

        await User.findByIdAndUpdate(tempUserId, {
            subscriptionPlan: tempPlanId,
            subscriptionStatus: "active",
            nextBillingDate: validUntil,
        });

      } else if (status === "FAILURE" && responseCode === "PG0000F") {
        console.log(`Payment FAILURE for cTxnId: ${cTxnId}`);
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
  }

  res.status(200).send("OK");
});

export default router;