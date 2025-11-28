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
    const { amount, name, mobile } = req.body;

    const reference_id = "SKEYLET_" + Date.now();

    const payloadData = {
      reference_id,
      from_account: FROM_ACCOUNT,
      currency_code: "INR",
      transfer_amount: Number(amount).toFixed(2),
      transfer_type: "1",

      // Hosted Page → card fields must stay empty
      card_number: "",
      card_expiry_month: "",
      card_expiry_year: "",
      card_cvv: "",
      card_holder_name: name || "",

      purpose_message: "Skeylet Subscription"
    };

    // Encrypt the payload
    const encrypted = encryptPayload(payloadData);

    // Create multipart/form-data request
    const form = new FormData();
    form.append("payload", encrypted.payload);
    form.append("iv", encrypted.iv);

    // Send request to VariantPay
    const gatewayRes = await axios.post(VARIANT_URL, form, {
      headers: {
        ...form.getHeaders(), // crucial for multipart/form-data
        "client-id": CLIENT_ID,
        "fps3-api-key": API_KEY,
        "client-secret": CLIENT_SECRET,
        "service-secret": SERVICE_SECRET,
      },
    });

    // Decrypt the response
    const decrypted = decryptVariantPayResponse(gatewayRes.data);

    if (decrypted.status !== "SUCCESS") {
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
    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
    });
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

    if (!payload || !iv) {
      return res.status(400).json({
        success: false,
        message: "Missing payload/iv"
      });
    }

    const decrypted = decryptVariantPayResponse({ payload, iv });

    console.log("🔔 WEBHOOK RECEIVED:", decrypted);

    const {
      sanTxnId,
      status,
      message,
      reference_id,
      transfer_amount,
    } = decrypted;

    if (status === "SUCCESS") {
      console.log("💰 Payment SUCCESS:", sanTxnId);

      // TODO: update your DB here
      // await Payment.updateOne({ reference_id }, { status: "SUCCESS" });

      // TODO: enable subscription
      // await User.updateOne({ userId }, { planActive: true });

    } else {
      console.log("❌ Payment FAILED:", sanTxnId, message);

      // await Payment.updateOne({ reference_id }, { status: "FAILED" });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Webhook ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed"
    });
  }
});

/* ======================================================
 * 👉 LEG 4: SECURE FRONTEND VERIFICATION
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
    
    // Placeholder logic for demonstration:
    const finalStatus = "SUCCESS"; // Replace with paymentRecord.status
    const isPlanActive = true;     // Replace with user.planActive

    if (finalStatus === "SUCCESS" && isPlanActive) {
      return res.json({
        success: true,
        status: "SUCCESS",
        message: "Payment verified and subscription is active."
      });
    }

    return res.status(400).json({
      success: false,
      status: finalStatus,
      message: "Transaction status is not successful or subscription is not active."
    });

  } catch (err) {
    console.error("Verification endpoint error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during verification" });
  }
});

export default router;
