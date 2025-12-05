// file: backend/routes/variantPay.js

import express from "express";
import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";

import Payment from "../models/Payment.js"; 
import User from "../models/User.js"; 
import Plan from "../models/Plan.js";

const router = express.Router();

// ---------------------- VariantPay Config ----------------------
const apiUrl = process.env.VARIANTPAY_API_ENDPOINT || "https://payments.variantpay.com/cbs/ccs/initiate";

const headers = {
  "client-id": process.env.VARIANTPAY_CLIENT_ID,
  "fps3-api-key": process.env.VARIANTPAY_API_KEY,
  "client-secret": process.env.VARIANTPAY_CLIENT_SECRET,
  "service-secret": process.env.VARIANTPAY_SERVICE_SECRET,
  "Content-Type": "application/json",
};

const secretKey = process.env.VARIANTPAY_SECRET_KEY;

// ---------------------- AES Encrypt/Decrypt ----------------------
function encryptAES_PHP_STYLE(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);

  let encryptedBase64Text = cipher.update(JSON.stringify(data), "utf8", "base64");
  encryptedBase64Text += cipher.final("base64");

  // Double-base64 like PHP
  const doubleBase64Payload = Buffer.from(encryptedBase64Text, "utf8").toString("base64");

  return {
    payload: doubleBase64Payload,
    iv: iv.toString("base64")
  };
}

function decryptAES(payloadB64, ivB64, key) {
  if (!payloadB64 || !ivB64) throw new Error("Missing payload or iv");

  const iv = Buffer.from(ivB64, "base64");
  if (iv.length !== 16) throw new Error("Invalid IV length");

  const attemptDecrypt = (rawBuffer) => {
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);
      const out = Buffer.concat([decipher.update(rawBuffer), decipher.final()]);
      return out.toString("utf8");
    } catch (e) {
      return false;
    }
  };

  // Single decode
  const singleDecoded = Buffer.from(payloadB64, "base64");
  let res = attemptDecrypt(singleDecoded);
  if (res !== false) return res;

  // Double decode (in case VariantPay double-encodes)
  const asText = singleDecoded.toString("utf8");
  if (/^[A-Za-z0-9+/= \r\n\t]+$/.test(asText)) {
    try {
      const doubleDecoded = Buffer.from(asText, "base64");
      res = attemptDecrypt(doubleDecoded);
      if (res !== false) return res;
    } catch {}
  }

  throw new Error("Decryption failed (invalid key/iv or wrong payload encoding)");
}

// ---------------------- CREATE PAYMENT ----------------------
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, mobile, userId, planId } = req.body;
    const reference_id = "SKEYLET_" +userId+ Date.now();
    // 🚀 NEW: Validate required data
    if (!userId || !planId) {
        return res.status(400).json({ success: false, message: "Missing user or plan ID." });
    }
    // 🚀 NEW: Create a PENDING Payment record before calling gateway
    const newPayment = new Payment({
        user: userId,
        plan: planId,
        amount: amount,
        currency: "INR",
        status: "pending",
        method: "variantpay",
        referenceId: reference_id, // Our internal reference
    });
    await newPayment.save();

    // Dummy card payload
    const payloadData = {
      reference_id,
      from_account: process.env.VARIANTPAY_FROM_ACCOUNT,
      currency_code: "INR",
      transfer_amount: Number(amount).toFixed(2),
      transfer_type: "1",
      card_number: "4375518860306023",
      card_expiry_month: "12",
      card_expiry_year: "77",
      card_cvv: "359",
      card_holder_name: name || "Test User",
      purpose_message: "Skeylet Subscription",
      receipt_url: "https://skeylet.com/payment-status",
      callback_url: "https://api.skeylet.com/api/payments/callback",
      return_url: `https://skeylet.com/payment-status?ref=${reference_id}`,
    };

    const encrypted = encryptAES_PHP_STYLE(payloadData, secretKey);

    // Send request
    const gatewayRes = await axios.post(apiUrl, encrypted, {
      headers,
      timeout: 15000,
    });

    const resp = gatewayRes.data;

    if (!resp.payload || !resp.iv) {
      await Payment.deleteOne({ referenceId: reference_id });
      return res.status(400).json({ success: false, message: "Invalid response from VariantPay" });
    }

    // Decrypt response
    const decrypted = JSON.parse(decryptAES(resp.payload, resp.iv, secretKey));
    // console.log("DECRYPTED RESPONSE:", decrypted);

    // Extract payment link safely
    let paymentLink = null;
    if (typeof decrypted.paymentLink === "string") {
      paymentLink = decrypted.paymentLink;
    } else if (decrypted.paymentLink?.linkUrl) {
      paymentLink = decrypted.paymentLink.linkUrl;
    }

    if (!paymentLink) {
      await Payment.deleteOne({ referenceId: reference_id });
      return res.status(400).json({ success: false, message: "No payment link returned" });
    }

    // Return payment link to frontend
    return res.json({
      success: true,
      paymentLink,
      referenceId: reference_id,
    });

  } catch (err) {
    console.error("VariantPay error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || "Payment initiation failed",
    });
  }
});

// ---------------------- VERIFY PAYMENT (Final Step) ----------------------
router.post("/callback", async (req, res) => {
  console.log("VariantPay CALLBACK RECEIVED:", req.body);
    try {
        const {
            sanTxnId,
            status,
            responseCode,
            message,
            cTxnId
        } = req.body;

        if (!cTxnId || !sanTxnId) {
            return res.status(400).send("Missing required fields.");
        }

        // Find payment using cTxnId (reference_id)
        const payment = await Payment.findOne({ referenceId: cTxnId });

        if (!payment) {
            return res.status(404).send("Payment record not found.");
        }

        if (payment.status === "active") {
            return res.send("Already processed");
        }

        // Update payment
        payment.status = status === "SUCCESS" ? "active" : "failed";
        payment.PaymentId = sanTxnId;
        payment.updatedAt = new Date();
        payment.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await payment.save();

        if (status !== "SUCCESS") {
            return res.redirect("https://skeylet.com/payment-failed");
            // return res.status(200).send("Callback received. Payment failed.");
        }

        // Update user subscription
        const user = await User.findById(payment.user);
        if (user) {
            user.subscriptionPlan = payment.plan;
            user.nextBillingDate = payment.validUntil;
            user.subscriptionStatus = "active";
            await user.save();
        }

        // Redirect user to success page
        return res.redirect("https://skeylet.com/payment-success");
        // return res.status(200).send("Callback received and processed successfully.");
    } catch (err) {
        console.error("Callback Error:", err);
        return res.status(500).send("Server error");
    }
});

router.get("/status/:referenceId", async (req, res) => {
  try {
    const payment = await Payment.findOne({ referenceId: req.params.referenceId });

    if (!payment) {
      return res.json({ status: "not_found" });
    }

    return res.json({ status: payment.status });
  } catch (err) {
    console.error("Status check error:", err);
    return res.status(500).json({ status: "error" });
  }
});


export default router;