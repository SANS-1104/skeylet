import express from "express";
import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";

const router = express.Router();

const VARIANT_URL = "https://payments.variantpay.com/cbs/ccs/initiate";

// ENV Vars
const CLIENT_ID = process.env.VARIANTPAY_CLIENT_ID;
const API_KEY = process.env.VARIANTPAY_API_KEY;
const CLIENT_SECRET = process.env.VARIANTPAY_CLIENT_SECRET;
const SERVICE_SECRET = process.env.VARIANTPAY_SERVICE_SECRET;
const SECRET_KEY = process.env.VARIANTPAY_SECRET_KEY; // EXACT secret key from portal
const FROM_ACCOUNT = process.env.VARIANTPAY_FROM_ACCOUNT;

console.log("SECRET KEY FROM ENV:", SECRET_KEY);
console.log("KEY LENGTH:", SECRET_KEY.length);

/* --------------------------------------------------------
 * FIX 1 → PHP-Compatible uniqid() + sha256 IV
 * --------------------------------------------------------
 */
function generatePhpCompatibleIV() {
  const uniqid = Date.now().toString(16) + Math.random().toString().slice(2);
  const sha = crypto.createHash("sha256").update(uniqid).digest("hex");
  const ivStr = sha.substring(0, 16); // EXACT like PHP
  return Buffer.from(ivStr, "utf8");  // ASCII IV
}

/* --------------------------------------------------------
 * FIX 2 → Use RAW 32-byte SECRET KEY (not hashed)
 * --------------------------------------------------------
 */
function encryptPayload(data) {
  const key = Buffer.from(SECRET_KEY, "utf8");
  const iv = generatePhpCompatibleIV();

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    payload: encrypted,
    iv: iv.toString("base64")
  };
}

function decryptVariantPayResponse(resp) {
  const key = Buffer.from(SECRET_KEY, "utf8");
  const ivBuf = Buffer.from(resp.iv, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuf);
  let decrypted = decipher.update(resp.payload, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

/* ======================================================
 * 👉 LEG 1: Create Payment Link
 * ======================================================
 */

router.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, mobile, userId, planId, billingType } = req.body;
    // ⚠️ NOTE: Assumes userId and planId are passed from the CheckoutPage
    
    // Use .trim() to fix key decryption issue (PGH003)
    const SECRET_KEY_TRIMMED = SECRET_KEY.trim(); 
    
    // 1. Generate unique internal reference
    const reference_id = "SKEYLET_" + Date.now();

    // 2. Save PENDING payment record
    const newPayment = await Payment.create({
      user: userId, 
      plan: planId,
      amount: Number(amount),
      currency: "INR",
      status: "pending",
      method: "variantpay",
      referenceId: reference_id,
      // We don't have sanTxnId yet, so leave PaymentId empty
    });

    // 3. Prepare Payload for VariantPay
    const payloadData = {
      reference_id,
      from_account: FROM_ACCOUNT,
      currency_code: "INR",
      transfer_amount: Number(amount).toFixed(2),
      transfer_type: "1",
      // ... other card fields ...
      purpose_message: `Skeylet Subscription (${billingType})`
    };

    // 4. Encrypt and send to VariantPay
    const encrypted = encryptPayload(payloadData); 
    // ... (rest of axios call to VariantPay)
    
    const gatewayRes = await axios.post(VARIANT_URL, form, {
      headers: { /* ... headers ... */ },
    });

    const decrypted = decryptVariantPayResponse(gatewayRes.data);

    if (decrypted.status !== "SUCCESS") {
      // Mark our payment as failed if gateway fails to initiate
      newPayment.status = "failed";
      await newPayment.save();
      
      return res.status(400).json({
        success: false,
        message: decrypted.message,
      });
    }

    return res.json({
      success: true,
      paymentLink: decrypted.paymentLink.linkUrl,
      referenceId: reference_id,
    });

  } catch (err) {
    console.error("VariantPay error:", err.response?.data || err);
    return res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
});


/* ======================================================
 * 👉 LEG 2: FRONTEND REDIRECT (Browser)
 *    https://api.skeylet.com/api/variantpay/callback?sanTxnId=..&status=..
 * ======================================================
 */
router.get("/callback", async (req, res) => {
  try {
    const { sanTxnId, status } = req.query;

    if (!sanTxnId) {
      return res.status(400).send("Missing sanTxnId");
    }

    // Redirect the user back to frontend UI
    return res.redirect(
      `https://skeylet.com/payment-status?sanTxnId=${sanTxnId}&status=${status}`
    );

  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).send("Callback handling failed");
  }
});


/* ======================================================
 * 👉 LEG 3: SERVER-TO-SERVER WEBHOOK
 * Hit directly by VariantPay backend → must decrypt
 * ======================================================
 */

router.post("/webhook", async (req, res) => {
  try {
    const { payload, iv } = req.body;
    // ... (initial validation for payload/iv)

    const decrypted = decryptVariantPayResponse({ payload, iv }); 
    console.log("🔔 WEBHOOK RECEIVED:", decrypted);

    const {
      sanTxnId,
      status, // The actual payment result from the bank/gateway
      reference_id, // Our internal ID created in LEG 1
    } = decrypted;

    // 1. Find the pending payment record using our internal reference ID
    const paymentRecord = await Payment.findOne({ referenceId: reference_id });

    if (!paymentRecord) {
      // If the record isn't found, log an error but return success to the gateway to prevent retries.
      console.error("❌ WEBHOOK ERROR: Payment record not found for reference:", reference_id);
      return res.json({ success: true, message: "Payment record not found internally" });
    }

    // 2. Determine final status and update Payment record
    const finalStatus = status === "SUCCESS" ? "active" : "failed";
    paymentRecord.status = finalStatus;
    paymentRecord.PaymentId = sanTxnId; // Store the gateway's ID
    paymentRecord.updatedAt = Date.now();
    await paymentRecord.save();

    // 3. Update User Subscription (ONLY on SUCCESS)
    if (finalStatus === "active") {
      console.log(`💰 Payment SUCCESS: Transaction ${sanTxnId} confirmed.`);
      
      const user = await User.findById(paymentRecord.user);
      
      if (user) {
        // Calculate the next billing date (assuming a 1-year plan based on the Plan model)
        const validUntilDate = new Date();
        validUntilDate.setFullYear(validUntilDate.getFullYear() + 1); 
        
        // Update user fields to activate subscription
        user.subscriptionPlan = paymentRecord.plan; 
        // The User pre-save hook handles setting subscriptionStatus to 'active' and monthlyQuota.
        await user.save(); 
        
        // Finalize payment record validUntil date
        paymentRecord.validUntil = validUntilDate;
        await paymentRecord.save();
      }
    } else {
      console.log(`❌ Payment FAILED: Transaction ${sanTxnId} failed.`);
    }

    // Always respond with success to the webhook to acknowledge receipt
    return res.json({ success: true });

  } catch (err) {
    console.error("Webhook ERROR:", err);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});


/* ======================================================
 * 👉 LEG 4: SECURE FRONTEND VERIFICATION (UPDATED)
 * Used by the frontend (PaymentStatusPage) to confirm
 * the status after the webhook has updated the database.
 * ======================================================
 */
router.post("/verify-variantpay-txn", async (req, res) => {
  try {
    const { sanTxnId } = req.body;

    if (!sanTxnId) {
      return res.status(400).json({ success: false, message: "Missing transaction ID" });
    }
    
    // 1. Find the related payment record using the gateway's ID (sanTxnId)
    const paymentRecord = await Payment.findOne({ PaymentId: sanTxnId });
    
    if (!paymentRecord) {
      // If no record found, the webhook hasn't arrived yet (still PENDING/PROCESSING)
      return res.status(400).json({ 
        success: false, 
        status: "PENDING", 
        message: "Transaction verification pending. Please check dashboard in a moment." 
      });
    }

    // 2. Find the associated User and populate the Plan name
    const user = await User.findById(paymentRecord.user).populate('subscriptionPlan'); 
    
    // 3. Check the definitive status from our source of truth
    if (paymentRecord.status === "active" && user?.subscriptionStatus === "active") {
      return res.json({
        success: true,
        status: "SUCCESS",
        message: "Payment verified and subscription is active.",
        // Return plan name and billing date to the frontend
        plan: user.subscriptionPlan.name, 
        nextBillingDate: user.nextBillingDate,
      });
    }

    // 4. Handle non-successful status
    const statusFromDB = paymentRecord.status.toUpperCase();
    
    return res.status(400).json({
      success: false,
      status: statusFromDB,
      message: statusFromDB === "FAILED" ? 
        "Payment failed. Please try again." : 
        "Transaction is not yet marked active in our system."
    });

  } catch (err) {
    console.error("Verification endpoint error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during verification" });
  }
});



export default router;
