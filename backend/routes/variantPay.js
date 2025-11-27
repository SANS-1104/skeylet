import express from "express";
import axios from "axios";
import crypto from "crypto";

const router = express.Router();

const VARIANT_URL = "https://payments.variantpay.com/cbs/ccs/initiate";

// ENV Vars
const CLIENT_ID = process.env.VARIANTPAY_CLIENT_ID;
const API_KEY = process.env.VARIANTPAY_API_KEY;
const CLIENT_SECRET = process.env.VARIANTPAY_CLIENT_SECRET;
const SERVICE_SECRET = process.env.VARIANTPAY_SERVICE_SECRET;
const SECRET_KEY = process.env.VARIANTPAY_SECRET_KEY;    // EXACT secret from portal
const FROM_ACCOUNT = process.env.VARIANTPAY_FROM_ACCOUNT;  // Merchant Account ID

// AES-256-CBC encryption (matching PHP exactly)
function encryptPayload(data) {
  const ivString = crypto
    .createHash("sha256")
    .update(crypto.randomUUID())
    .digest("hex")
    .substring(0, 16);

  const iv = Buffer.from(ivString, "utf8");

  // IMPORTANT FIX — USE SECRET KEY AS RAW BYTES
  const key = Buffer.from(SECRET_KEY, "utf8");  // 32 bytes EXACTLY

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    payload: encrypted,
    iv: iv.toString("base64"),
  };
}

// decrypt VariantPay response
function decryptVariantPayResponse(resp) {
  const key = Buffer.from(SECRET_KEY, "utf8");  // RAW BYTES, NOT HASHED
  const ivBuf = Buffer.from(resp.iv, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuf);
  let decrypted = decipher.update(resp.payload, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

/**
 * 👉 LEG 1: Create Transaction → Receive paymentLink → Send to frontend
 */
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, mobile } = req.body;

    const reference_id = "SKEYLET_" + Date.now();

    // HPP PAYLOAD — card fields intentionally EMPTY
    const payloadData = {
      reference_id,
      from_account: FROM_ACCOUNT,
      currency_code: "INR",
      transfer_amount: Number(amount).toFixed(2),
      transfer_type: "1",

      card_number: "",
      card_expiry_month: "",
      card_expiry_year: "",
      card_cvv: "",
      card_holder_name: name || "",

      purpose_message: "Skeylet Subscription",
    };

    const encrypted = encryptPayload(payloadData);

    const gatewayRes = await axios.post(
      VARIANT_URL,
      {
        payload: encrypted.payload,
        iv: encrypted.iv,
      },
      {
        headers: {
          "client-id": CLIENT_ID,
          "fps3-api-key": API_KEY,
          "client-secret": CLIENT_SECRET,
          "service-secret": SERVICE_SECRET,
        },
      }
    );

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

export default router;
