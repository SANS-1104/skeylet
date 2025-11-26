// file: backend/routes/variantPay.js
import express from "express";
import axios from "axios";
import crypto from "crypto";

import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";

const router = express.Router();

// ---- VariantPay config (all from .env) ----
const VARIANTPAY_CONFIG = {
  INITIATE_URL:
    process.env.VARIANTPAY_API_ENDPOINT ||
    "https://payments.variantpay.com/cbs/ccs/initiate", // Payment GATEWAY endpoint

  CLIENT_ID: process.env.VARIANTPAY_CLIENT_ID,
  API_KEY: process.env.VARIANTPAY_API_KEY,
  CLIENT_SECRET: process.env.VARIANTPAY_CLIENT_SECRET,
  SERVICE_SECRET: process.env.VARIANTPAY_SERVICE_SECRET,

  SECRET_KEY: process.env.VARIANTPAY_SECRET_KEY, // AES secret key from VariantPay (must be 32 chars)
  FROM_ACCOUNT: process.env.VARIANTPAY_FROM_ACCOUNT, // Account ID at VariantPay portal

  CURRENCY_CODE: "INR",
  TRANSFER_TYPE: "1", // Fixed – as per Payment Gateway doc
};

// ---- Basic sanity checks (fail fast if misconfigured) ----
if (!VARIANTPAY_CONFIG.SECRET_KEY) {
  console.error("[VariantPay] VARIANTPAY_SECRET_KEY not set in env");
}

const KEY_BUFFER = VARIANTPAY_CONFIG.SECRET_KEY
  ? Buffer.from(VARIANTPAY_CONFIG.SECRET_KEY, "utf8")
  : null;

if (KEY_BUFFER && KEY_BUFFER.length !== 32) {
  console.error(
    "[VariantPay] VARIANTPAY_SECRET_KEY must be exactly 32 bytes for AES-256-CBC. " +
      `Current length: ${KEY_BUFFER.length}`
  );
}

console.log(
  "[VariantPay] Secret len:",
  VARIANTPAY_CONFIG.SECRET_KEY ? VARIANTPAY_CONFIG.SECRET_KEY.length : "MISSING"
);

// ---- AES helpers ----
function encryptPayload(jsonString) {
  if (!KEY_BUFFER) {
    throw new Error("VariantPay secret key not configured");
  }

  // Generate 16-char ASCII IV (matching PHP: substr(hash('sha256', uniqid()), 0, 16))
  const ivString = crypto
    .createHash("sha256")
    .update(crypto.randomUUID())
    .digest("hex")
    .substring(0, 16);

  const ivBuffer = Buffer.from(ivString, "utf8");

  const cipher = crypto.createCipheriv("aes-256-cbc", KEY_BUFFER, ivBuffer);

  // Step 1: get raw ciphertext bytes
  const encryptedBuf = Buffer.concat([
    cipher.update(Buffer.from(jsonString, "utf8")),
    cipher.final(),
  ]);

  // Step 2: C1 = base64(cipherBytes)  (what openssl_encrypt returns by default)
  const onceBase64 = encryptedBuf.toString("base64");

  // Step 3: C2 = base64(C1)  (what VariantPay actually sends as `payload`)
  const doubleBase64Payload = Buffer.from(onceBase64, "utf8").toString("base64");

  // IV: base64(16-char ASCII IV)
  const ivBase64 = Buffer.from(ivString, "utf8").toString("base64");

  return {
    payload: doubleBase64Payload,
    iv: ivBase64,
  };
}

function decryptPayload(payloadDoubleBase64, ivBase64) {
  if (!KEY_BUFFER) {
    throw new Error("VariantPay secret key not configured");
  }

  // Reverse IV: base64 -> ASCII string -> bytes
  const ivString = Buffer.from(ivBase64, "base64").toString("utf8");
  const ivBuffer = Buffer.from(ivString, "utf8");

  // Reverse payload:
  // Step 1: doubleBase64 -> onceBase64 (C2 -> C1)
  const onceBase64 = Buffer.from(payloadDoubleBase64, "base64").toString("utf8");

  // Step 2: onceBase64 -> raw ciphertext bytes
  const encryptedBuf = Buffer.from(onceBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY_BUFFER, ivBuffer);

  const decryptedBuf = Buffer.concat([
    decipher.update(encryptedBuf),
    decipher.final(),
  ]);

  return decryptedBuf.toString("utf8");
}


// router.post("/initiate-transaction", async (req, res) => {
//   try {
//     const { amount, clientReferenceId, userDetails } = req.body;

//     console.log("[VariantPay] Incoming initiate-transaction body:", req.body);

//     const numericAmount = Number(amount);

//     if (!numericAmount || numericAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid amount",
//       });
//     }

//     if (!clientReferenceId) {
//       return res.status(400).json({
//         success: false,
//         message: "clientReferenceId is required",
//       });
//     }

//     if (!userDetails || !userDetails.mobile) {
//       return res.status(400).json({
//         success: false,
//         message: "userDetails.mobile is required",
//       });
//     }

//     if (!KEY_BUFFER || KEY_BUFFER.length !== 32) {
//       console.error(
//         "[VariantPay] Secret key invalid or missing. Length:",
//         KEY_BUFFER?.length
//       );
//       return res.status(500).json({
//         success: false,
//         message: "VariantPay secret key misconfigured on server",
//       });
//     }

//     // 1) Build payload according to Payment Gateway doc
//     const payloadData = {
//       reference_id: clientReferenceId,
//       from_account: VARIANTPAY_CONFIG.FROM_ACCOUNT,
//       currency_code: VARIANTPAY_CONFIG.CURRENCY_CODE,
//       transfer_amount: numericAmount.toFixed(2), // "100.00"
//       transfer_type: VARIANTPAY_CONFIG.TRANSFER_TYPE, // "1" fixed

//       // required in direct API; for HPP this will be used as card holder name
//       card_holder_name: userDetails.name || clientReferenceId,

//       purpose_message: `Skeylet subscription for ${clientReferenceId}`,

//       // extra meta (not in doc but harmless)
//       customer_mobile: userDetails.mobile,
//     };

//     const jsonPayload = JSON.stringify(payloadData);
//     console.log("[VariantPay] Plain payload:", jsonPayload);

//     // 2) Encrypt payload using AES-256-CBC
//     const { payload: encryptedPayload, iv } = encryptPayload(jsonPayload);

//     console.log("[VariantPay] Encrypted payload + IV prepared");

//     // 3) Build multipart/form-data body
//     // Using URLSearchParams WAS okay for some APIs, but the doc explicitly shows --form (multipart)
//     const formData = new URLSearchParams();
//     formData.append("payload", encryptedPayload);
//     formData.append("iv", iv);

//     console.log(
//       "[VariantPay] Hitting VariantPay at:",
//       VARIANTPAY_CONFIG.INITIATE_URL
//     );

//     let vpResponse;
//     try {
//       const axiosResponse = await axios.post(
//         VARIANTPAY_CONFIG.INITIATE_URL,
//         formData.toString(),
//         {
//           headers: {
//             "client-id": VARIANTPAY_CONFIG.CLIENT_ID,
//             "fps3-api-key": VARIANTPAY_CONFIG.API_KEY,
//             "client-secret": VARIANTPAY_CONFIG.CLIENT_SECRET,
//             "service-secret": VARIANTPAY_CONFIG.SERVICE_SECRET,
//             "Content-Type": "application/x-www-form-urlencoded",
//             accept: "application/json",
//           },
//           timeout: 60_000,
//         }
//       );
//       vpResponse = axiosResponse.data;
//     } catch (axiosErr) {
//       console.error(
//         "[VariantPay] Axios error calling gateway:",
//         axiosErr.response?.status,
//         axiosErr.response?.data || axiosErr.message
//       );
//       return res.status(502).json({
//         success: false,
//         message:
//           axiosErr.response?.data?.message ||
//           "Could not reach VariantPay gateway. Check headers / endpoint / IP whitelisting.",
//       });
//     }

//     console.log("[VariantPay] Raw gateway response:", vpResponse);

//     // 5) Validate & decrypt VariantPay response
//     if (!vpResponse.payload || !vpResponse.iv) {
//       console.error("[VariantPay] Unexpected response (no payload/iv):", vpResponse);
//       return res.status(502).json({
//         success: false,
//         message:
//           vpResponse.message ||
//           "VariantPay returned unexpected response. No encrypted payload.",
//       });
//     }

//     let decryptedText;
//     try {
//       decryptedText = decryptPayload(vpResponse.payload, vpResponse.iv);
//     } catch (decErr) {
//       console.error("[VariantPay] Decryption failed:", decErr.message);
//       return res.status(500).json({
//         success: false,
//         message:
//           "Failed to decrypt VariantPay response. Check VARIANTPAY_SECRET_KEY matches their portal.",
//       });
//     }

//     console.log("[VariantPay] Decrypted raw response:", decryptedText);

//     let decrypted;
//     try {
//       decrypted = JSON.parse(decryptedText);
//     } catch (parseErr) {
//       console.error("[VariantPay] JSON parse failed on decrypted text:", parseErr.message);
//       return res.status(500).json({
//         success: false,
//         message:
//           "VariantPay response not valid JSON after decryption. Verify encryption key and integration mode.",
//       });
//     }

//     console.log("[VariantPay] Decrypted response object:", decrypted);

//     // 6) Success -> return payment link to frontend
//     if (
//       decrypted.status === "SUCCESS" &&
//       decrypted.responseCode === "PG00000" &&
//       decrypted.paymentLink?.linkUrl
//     ) {
//       return res.json({
//         success: true,
//         redirectUrl: decrypted.paymentLink.linkUrl,
//         sanTxnId: decrypted.sanTxnId,
//         cTxnId: decrypted.cTxnId,
//       });
//     }

//     // 7) Failure from gateway (but decrypted correctly)
//     console.error("[VariantPay] Initiation FAILED at gateway:", decrypted);
//     return res.status(400).json({
//       success: false,
//       message: decrypted.message || "VariantPay initiation failed",
//       responseCode: decrypted.responseCode,
//       status: decrypted.status,
//     });
//   } catch (err) {
//     console.error("[VariantPay] initiate-transaction UNEXPECTED error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error during VariantPay payment initiation",
//     });
//   }
// });

router.post("/initiate-transaction", async (req, res) => {
  try {
    const { amount, clientReferenceId, userDetails } = req.body;

    console.log("[VariantPay-HPP] Request received:", req.body);

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!clientReferenceId) {
      return res.status(400).json({ success: false, message: "clientReferenceId is required" });
    }

    if (!userDetails || !userDetails.name) {
      return res.status(400).json({ success: false, message: "User name invalid" });
    }

    if (!userDetails.mobile) {
      return res.status(400).json({ success: false, message: "User mobile invalid" });
    }

    // ---- ⭐ HPP MODE – NO ENCRYPTION REQUIRED ⭐ ----
    const formData = new URLSearchParams();
    formData.append("reference_id", clientReferenceId);
    formData.append("from_account", VARIANTPAY_CONFIG.FROM_ACCOUNT);
    formData.append("currency_code", "INR");
    formData.append("transfer_amount", numericAmount.toFixed(2));
    formData.append("transfer_type", "1");
    formData.append("card_holder_name", userDetails.name);

    console.log("[VariantPay-HPP] Posting to:", VARIANTPAY_CONFIG.INITIATE_URL);

    const axiosResponse = await axios.post(
      VARIANTPAY_CONFIG.INITIATE_URL,
      formData.toString(),
      {
        headers: {
          "client-id": VARIANTPAY_CONFIG.CLIENT_ID,
          "fps3-api-key": VARIANTPAY_CONFIG.API_KEY,
          "client-secret": VARIANTPAY_CONFIG.CLIENT_SECRET,
          "service-secret": VARIANTPAY_CONFIG.SERVICE_SECRET,
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        timeout: 60000,
      }
    );

    const vpResponse = axiosResponse.data;
    console.log("[VariantPay-HPP] Raw Response:", vpResponse);

    // HPP does NOT return encrypted payload — it's already JSON
    if (
      vpResponse.status === "SUCCESS" &&
      vpResponse.responseCode === "PG00000" &&
      vpResponse.paymentLink?.linkUrl
    ) {
      return res.json({
        success: true,
        redirectUrl: vpResponse.paymentLink.linkUrl,
        sanTxnId: vpResponse.sanTxnId,
        cTxnId: vpResponse.cTxnId,
      });
    }

    return res.status(400).json({
      success: false,
      message: vpResponse.message || "VariantPay failed",
      responseCode: vpResponse.responseCode,
      status: vpResponse.status,
    });
  } catch (err) {
    console.error("[VariantPay-HPP] Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while contacting VariantPay",
    });
  }
});


// router.post("/callback", async (req, res) => {
//   const callbackData = req.body;
//   console.log("[VariantPay] Callback received:", callbackData);
//   const {
//     sanTxnId,
//     status,
//     responseCode,
//     cTxnId,
//     amountDetails,
//     bankRefId,
//     message,
//   } = callbackData;

//   const amount =
//     amountDetails?.amount || amountDetails?.originalAmount || null;

//   // TODO: replace with your real lookup:
//   const tempUserId = "USER_ID_FROM_DB_FOR_" + cTxnId;
//   const tempPlanId = "PLAN_ID_FROM_DB_FOR_" + cTxnId;
//   const tempBillingType = "yearly";

//   if (!tempUserId || !tempPlanId) {
//     console.error(
//       `[VariantPay] Callback: cannot map cTxnId ${cTxnId} to user/plan`
//     );
//     return res.status(200).send("Order not found, acknowledged.");
//   }

//   try {
//     if (status === "SUCCESS" && responseCode === "PG00000") {
//       console.log(
//         `[VariantPay] Payment SUCCESS for cTxnId=${cTxnId}, sanTxnId=${sanTxnId}`
//       );

//       const plan = await Plan.findById(tempPlanId);
//       if (!plan) throw new Error("Plan not found");

//       const oneYearMs = 365 * 24 * 60 * 60 * 1000;
//       const validUntil = new Date(Date.now() + oneYearMs);

//       await Payment.create({
//         user: tempUserId,
//         plan: tempPlanId,
//         amount: amount ? Number(amount) : undefined,
//         status: "active",
//         method: "variantpay",
//         PaymentId: sanTxnId,
//         validUntil,
//         currency: "INR",
//         gatewayMeta: {
//           bankRefId,
//           message,
//         },
//       });

//       await User.findByIdAndUpdate(tempUserId, {
//         subscriptionPlan: tempPlanId,
//         subscriptionStatus: "active",
//         nextBillingDate: validUntil,
//       });
//     } else if (status === "FAILURE" && responseCode === "PG0000F") {
//       console.warn(
//         `[VariantPay] Payment FAILURE for cTxnId=${cTxnId}, sanTxnId=${sanTxnId}, message=${message}`
//       );

//       await Payment.create({
//         user: tempUserId,
//         plan: tempPlanId,
//         amount: amount ? Number(amount) : undefined,
//         status: "failed",
//         method: "variantpay",
//         PaymentId: sanTxnId,
//         currency: "INR",
//         gatewayMeta: {
//           bankRefId,
//           message,
//         },
//       });
//     } else {
//       console.warn(
//         `[VariantPay] Unusual status in callback: status=${status}, responseCode=${responseCode}, cTxnId=${cTxnId}`
//       );
//     }
//   } catch (err) {
//     console.error("[VariantPay] Error processing callback:", err);
//     // still respond 200 so gateway doesn't keep retrying forever
//   }

//   res.status(200).send("OK");
// });

router.post("/callback", async (req, res) => {
  try {
    console.log("[VariantPay-HPP] Callback received:", req.body);

    const callbackData = req.body;

    const {
      sanTxnId,
      status,
      responseCode,
      cTxnId,
      amountDetails,
      bankRefId,
      message,
    } = callbackData;

    const amount =
      amountDetails?.amount ||
      amountDetails?.originalAmount ||
      null;

    if (!cTxnId) {
      console.error("[VariantPay-HPP] Missing cTxnId in callback");
      return res.status(200).send("Missing cTxnId");
    }

    // ------------------------------------------
    // 🔥 1. Lookup user + plan using YOUR DB data
    // ------------------------------------------

    // You must have saved this reference_id earlier when user created order = clientReferenceId = cTxnId
    const order = await Payment.findOne({ clientReferenceId: cTxnId });

    if (!order) {
      console.error(`[VariantPay-HPP] No order found for cTxnId ${cTxnId}`);
      return res.status(200).send("Order not found, acknowledged");
    }

    const userId = order.user;
    const planId = order.plan;

    if (!userId || !planId) {
      console.error(
        `[VariantPay-HPP] Order does not have user/plan mapping for ${cTxnId}`
      );
      return res.status(200).send("Invalid order mapping");
    }

    // ------------------------------------------
    // 🔥 2. Process Success Status
    // ------------------------------------------
    if (status === "SUCCESS" && responseCode === "PG00000") {
      console.log(
        `[VariantPay-HPP] Payment SUCCESS → cTxnId=${cTxnId}, sanTxnId=${sanTxnId}`
      );

      const plan = await Plan.findById(planId);
      if (!plan) {
        console.error("[VariantPay-HPP] Plan not found for callback");
        return res.status(200).send("Plan missing");
      }

      // ✔ 1 Year validity — modify if your plan has different duration
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const validUntil = new Date(Date.now() + oneYearMs);

      // Record payment
      await Payment.create({
        user: userId,
        plan: planId,
        amount: amount ? Number(amount) : undefined,
        status: "active",
        method: "variantpay",
        PaymentId: sanTxnId,
        validUntil,
        currency: "INR",
        clientReferenceId: cTxnId,
        gatewayMeta: {
          bankRefId,
          message,
        },
      });

      // Update subscription
      await User.findByIdAndUpdate(userId, {
        subscriptionPlan: planId,
        subscriptionStatus: "active",
        nextBillingDate: validUntil,
      });

      return res.status(200).send("OK");
    }

    // ------------------------------------------
    // ❗ FAILURE CASE
    // ------------------------------------------
    if (status === "FAILURE" && responseCode === "PG0000F") {
      console.warn(
        `[VariantPay-HPP] Payment FAILURE → cTxnId=${cTxnId}, Reason: ${message}`
      );

      await Payment.create({
        user: userId,
        plan: planId,
        amount: amount ? Number(amount) : undefined,
        status: "failed",
        method: "variantpay",
        PaymentId: sanTxnId,
        currency: "INR",
        clientReferenceId: cTxnId,
        gatewayMeta: {
          bankRefId,
          message,
        },
      });

      return res.status(200).send("OK");
    }

    // ------------------------------------------
    // ⚠ Unusual Status (Pending / Unknown)
    // ------------------------------------------
    console.warn(
      `[VariantPay-HPP] Unexpected callback → status=${status}, responseCode=${responseCode}, cTxnId=${cTxnId}`
    );

    return res.status(200).send("OK");

  } catch (err) {
    console.error("[VariantPay-HPP] Callback processing error:", err);
    return res.status(200).send("OK"); // Always 200 so VariantPay does not retry
  }
});


export default router;
