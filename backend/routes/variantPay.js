// // file: backend/routes/variantPay.js
// import express from "express";
// import axios from "axios";

// import User from "../models/User.js";
// import Payment from "../models/Payment.js";
// import Plan from "../models/Plan.js";

// const router = express.Router();

// // ---- VariantPay config (all from .env) ----
// const VARIANTPAY_CONFIG = {
//   INITIATE_URL:
//     process.env.VARIANTPAY_API_ENDPOINT ||
//     "https://payments.variantpay.com/cbs/ccs/initiate",

//   CLIENT_ID: process.env.VARIANTPAY_CLIENT_ID,
//   API_KEY: process.env.VARIANTPAY_API_KEY,
//   CLIENT_SECRET: process.env.VARIANTPAY_CLIENT_SECRET,
//   SERVICE_SECRET: process.env.VARIANTPAY_SERVICE_SECRET,

//   FROM_ACCOUNT: process.env.VARIANTPAY_FROM_ACCOUNT, // Account ID at VariantPay portal
//   CURRENCY_CODE: "INR",
//   TRANSFER_TYPE: "1", // Fixed – as per Payment Gateway doc
// };

// // ---- Basic sanity checks (fail fast if misconfigured) ----
// if (!VARIANTPAY_CONFIG.SECRET_KEY) {
//   console.error("[VariantPay] VARIANTPAY_SECRET_KEY not set in env");
// }

// const KEY_BUFFER = VARIANTPAY_CONFIG.SECRET_KEY
//   ? Buffer.from(VARIANTPAY_CONFIG.SECRET_KEY, "utf8")
//   : null;

// if (KEY_BUFFER && KEY_BUFFER.length !== 32) {
//   console.error(
//     "[VariantPay] VARIANTPAY_SECRET_KEY must be exactly 32 bytes for AES-256-CBC. " +
//       `Current length: ${KEY_BUFFER.length}`
//   );
// }

// console.log(
//   "[VariantPay] Secret len:",
//   VARIANTPAY_CONFIG.SECRET_KEY ? VARIANTPAY_CONFIG.SECRET_KEY.length : "MISSING"
// );

// // ---- AES helpers ----
// function encryptPayload(jsonString) {
//   if (!KEY_BUFFER) {
//     throw new Error("VariantPay secret key not configured");
//   }

//   // Generate 16-char ASCII IV (matching PHP: substr(hash('sha256', uniqid()), 0, 16))
//   const ivString = crypto
//     .createHash("sha256")
//     .update(crypto.randomUUID())
//     .digest("hex")
//     .substring(0, 16);

//   const ivBuffer = Buffer.from(ivString, "utf8");

//   const cipher = crypto.createCipheriv("aes-256-cbc", KEY_BUFFER, ivBuffer);

//   // Step 1: get raw ciphertext bytes
//   const encryptedBuf = Buffer.concat([
//     cipher.update(Buffer.from(jsonString, "utf8")),
//     cipher.final(),
//   ]);

//   // Step 2: C1 = base64(cipherBytes)  (what openssl_encrypt returns by default)
//   const onceBase64 = encryptedBuf.toString("base64");

//   // Step 3: C2 = base64(C1)  (what VariantPay actually sends as `payload`)
//   const doubleBase64Payload = Buffer.from(onceBase64, "utf8").toString("base64");

//   // IV: base64(16-char ASCII IV)
//   const ivBase64 = Buffer.from(ivString, "utf8").toString("base64");

//   return {
//     payload: doubleBase64Payload,
//     iv: ivBase64,
//   };
// }

// function decryptPayload(payloadDoubleBase64, ivBase64) {
//   if (!KEY_BUFFER) {
//     throw new Error("VariantPay secret key not configured");
//   }

//   // Reverse IV: base64 -> ASCII string -> bytes
//   const ivString = Buffer.from(ivBase64, "base64").toString("utf8");
//   const ivBuffer = Buffer.from(ivString, "utf8");

//   // Reverse payload:
//   // Step 1: doubleBase64 -> onceBase64 (C2 -> C1)
//   const onceBase64 = Buffer.from(payloadDoubleBase64, "base64").toString("utf8");

//   // Step 2: onceBase64 -> raw ciphertext bytes
//   const encryptedBuf = Buffer.from(onceBase64, "base64");

//   const decipher = crypto.createDecipheriv("aes-256-cbc", KEY_BUFFER, ivBuffer);

//   const decryptedBuf = Buffer.concat([
//     decipher.update(encryptedBuf),
//     decipher.final(),
//   ]);

//   return decryptedBuf.toString("utf8");
// }

// router.post("/create-order", async (req, res) => {
//   try {
//     const { user, plan, amount, clientReferenceId } = req.body;

//     if (!user || !plan || !amount || !clientReferenceId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     // Check if order already exists (prevent duplicates)
//     const existing = await Payment.findOne({ clientReferenceId });
//     if (existing) {
//       return res.json({
//         success: true,
//         message: "Order already exists",
//         orderId: existing._id,
//       });
//     }

//     // Save initial order
//     const newOrder = await Payment.create({
//       user,
//       plan,
//       amount,
//       clientReferenceId,   // 🔥 This MUST match VariantPay cTxnId
//       status: "pending",   // Initial status
//       method: "variantpay",
//       currency: "INR",
//     });

//     return res.json({
//       success: true,
//       message: "Order created",
//       orderId: newOrder._id,
//     });

//   } catch (err) {
//     console.error("[VariantPay] create-order error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while creating order",
//     });
//   }
// });

// router.post("/initiate-transaction", async (req, res) => {
//   try {
//     const { amount, clientReferenceId, userDetails } = req.body;

//     console.log("[VariantPay-HPP] Request received:", req.body);

//     // Basic validation
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

//     if (!userDetails || !userDetails.name) {
//       return res.status(400).json({
//         success: false,
//         message: "userDetails.name is required",
//       });
//     }

//     if (!userDetails.mobile) {
//       return res.status(400).json({
//         success: false,
//         message: "userDetails.mobile is required",
//       });
//     }

//     // ⭐ IMPORTANT: ONLY send the fields VariantPay lists for the initial HPP leg
//     const formData = new URLSearchParams();
//     formData.append("reference_id", clientReferenceId);
//     formData.append("from_account", VARIANTPAY_CONFIG.FROM_ACCOUNT);
//     formData.append("transfer_amount", numericAmount.toFixed(2)); // "101.00"
//     formData.append("transfer_type", VARIANTPAY_CONFIG.TRANSFER_TYPE); // "1"
//     formData.append("currency_code", VARIANTPAY_CONFIG.CURRENCY_CODE); // "INR"
//     formData.append("card_holder_name", userDetails.name); // used on HPP UI

//     console.log("[VariantPay-HPP] Posting to:", VARIANTPAY_CONFIG.INITIATE_URL);
//     console.log("[VariantPay-HPP] Form data:", formData.toString());

//     const axiosResponse = await axios.post(
//       VARIANTPAY_CONFIG.INITIATE_URL,
//       formData.toString(),
//       {
//         headers: {
//           "client-id": VARIANTPAY_CONFIG.CLIENT_ID,
//           "fps3-api-key": VARIANTPAY_CONFIG.API_KEY,
//           "client-secret": VARIANTPAY_CONFIG.CLIENT_SECRET,
//           "service-secret": VARIANTPAY_CONFIG.SERVICE_SECRET,
//           "Content-Type": "application/x-www-form-urlencoded",
//           accept: "application/json",
//         },
//         timeout: 60000,
//       }
//     );

//     const vpResponse = axiosResponse.data;
//     console.log("[VariantPay-HPP] Raw Response:", vpResponse);

//     // HPP/documented purchase leg should return plain JSON with paymentLink
//     if (
//       vpResponse.status === "SUCCESS" &&
//       vpResponse.responseCode === "PG00000" &&
//       vpResponse.paymentLink?.linkUrl
//     ) {
//       return res.json({
//         success: true,
//         redirectUrl: vpResponse.paymentLink.linkUrl,
//         sanTxnId: vpResponse.sanTxnId,
//         cTxnId: vpResponse.cTxnId,
//       });
//     }

//     // Gateway returned a failure / validation error
//     console.error(
//       "[VariantPay-HPP] Gateway FAILED:",
//       vpResponse.status,
//       vpResponse.responseCode,
//       vpResponse.message
//     );

//     return res.status(400).json({
//       success: false,
//       message:
//         vpResponse.message ||
//         "VariantPay initiation failed. Check merchant configuration / request fields.",
//       responseCode: vpResponse.responseCode,
//       status: vpResponse.status,
//       raw: vpResponse,
//     });
//   } catch (err) {
//     console.error(
//       "[VariantPay-HPP] Error calling VariantPay:",
//       err.response?.status,
//       err.response?.data || err.message
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         err.response?.data?.message ||
//         "Internal server error while contacting VariantPay",
//     });
//   }
// });

// router.post("/callback", async (req, res) => {
//   try {
//     console.log("[VariantPay-HPP] Callback received:", req.body);

//     const callbackData = req.body;

//     const {
//       sanTxnId,
//       status,
//       responseCode,
//       cTxnId,
//       amountDetails,
//       bankRefId,
//       message,
//     } = callbackData;

//     const amount =
//       amountDetails?.amount ||
//       amountDetails?.originalAmount ||
//       null;

//     if (!cTxnId) {
//       console.error("[VariantPay-HPP] Missing cTxnId in callback");
//       return res.status(200).send("Missing cTxnId");
//     }

//     // ------------------------------------------
//     // 🔥 1. Lookup user + plan using YOUR DB data
//     // ------------------------------------------

//     // You must have saved this reference_id earlier when user created order = clientReferenceId = cTxnId
//     const order = await Payment.findOne({ clientReferenceId: cTxnId });

//     if (!order) {
//       console.error(`[VariantPay-HPP] No order found for cTxnId ${cTxnId}`);
//       return res.status(200).send("Order not found, acknowledged");
//     }

//     const userId = order.user;
//     const planId = order.plan;

//     if (!userId || !planId) {
//       console.error(
//         `[VariantPay-HPP] Order does not have user/plan mapping for ${cTxnId}`
//       );
//       return res.status(200).send("Invalid order mapping");
//     }

//     // ------------------------------------------
//     // 🔥 2. Process Success Status
//     // ------------------------------------------
//     if (status === "SUCCESS" && responseCode === "PG00000") {
//       console.log(
//         `[VariantPay-HPP] Payment SUCCESS → cTxnId=${cTxnId}, sanTxnId=${sanTxnId}`
//       );

//       const plan = await Plan.findById(planId);
//       if (!plan) {
//         console.error("[VariantPay-HPP] Plan not found for callback");
//         return res.status(200).send("Plan missing");
//       }

//       // ✔ 1 Year validity — modify if your plan has different duration
//       const oneYearMs = 365 * 24 * 60 * 60 * 1000;
//       const validUntil = new Date(Date.now() + oneYearMs);

//       // Record payment
//       await Payment.create({
//         user: userId,
//         plan: planId,
//         amount: amount ? Number(amount) : undefined,
//         status: "active",
//         method: "variantpay",
//         PaymentId: sanTxnId,
//         validUntil,
//         currency: "INR",
//         clientReferenceId: cTxnId,
//         gatewayMeta: {
//           bankRefId,
//           message,
//         },
//       });

//       // Update subscription
//       await User.findByIdAndUpdate(userId, {
//         subscriptionPlan: planId,
//         subscriptionStatus: "active",
//         nextBillingDate: validUntil,
//       });

//       return res.status(200).send("OK");
//     }

//     // ------------------------------------------
//     // ❗ FAILURE CASE
//     // ------------------------------------------
//     if (status === "FAILURE" && responseCode === "PG0000F") {
//       console.warn(
//         `[VariantPay-HPP] Payment FAILURE → cTxnId=${cTxnId}, Reason: ${message}`
//       );

//       await Payment.create({
//         user: userId,
//         plan: planId,
//         amount: amount ? Number(amount) : undefined,
//         status: "failed",
//         method: "variantpay",
//         PaymentId: sanTxnId,
//         currency: "INR",
//         clientReferenceId: cTxnId,
//         gatewayMeta: {
//           bankRefId,
//           message,
//         },
//       });

//       return res.status(200).send("OK");
//     }

//     // ------------------------------------------
//     // ⚠ Unusual Status (Pending / Unknown)
//     // ------------------------------------------
//     console.warn(
//       `[VariantPay-HPP] Unexpected callback → status=${status}, responseCode=${responseCode}, cTxnId=${cTxnId}`
//     );

//     return res.status(200).send("OK");

//   } catch (err) {
//     console.error("[VariantPay-HPP] Callback processing error:", err);
//     return res.status(200).send("OK"); // Always 200 so VariantPay does not retry
//   }
// });


// export default router;


// file: backend/routes/variantPay.js
import express from "express";
import axios from "axios";
// IMPORTANT: Need to import 'crypto' for the AES helpers, assuming it's available in the full environment
import crypto from "crypto"; 

import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";

const router = express.Router();

// ---- VariantPay config (all from .env) ----
const VARIANTPAY_CONFIG = {
  INITIATE_URL:
    process.env.VARIANTPAY_API_ENDPOINT ||
    "https://payments.variantpay.com/cbs/ccs/initiate",

  CLIENT_ID: process.env.VARIANTPAY_CLIENT_ID,
  API_KEY: process.env.VARIANTPAY_API_KEY,
  CLIENT_SECRET: process.env.VARIANTPAY_CLIENT_SECRET,
  SERVICE_SECRET: process.env.VARIANTPAY_SERVICE_SECRET,
  
  // NOTE: VARIANTPAY_SECRET_KEY is only used for the API-Based Encrypted Direct Transaction
  SECRET_KEY: process.env.VARIANTPAY_SECRET_KEY, 

  FROM_ACCOUNT: process.env.VARIANTPAY_FROM_ACCOUNT, // Account ID at VariantPay portal [cite: 74, 100]
  CURRENCY_CODE: "INR", // [cite: 74, 101, 120]
  TRANSFER_TYPE: "1", // Fixed – as per Payment Gateway doc [cite: 74, 103, 122]
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

  // Generate 16-char ASCII IV (matching PHP: substr(hash('sha256', uniqid()), 0, 16)) [cite: 114]
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

  // Step 2: C1 = base64(cipherBytes)
  const onceBase64 = encryptedBuf.toString("base64");

  // Step 3: C2 = base64(C1) (Double Base64 encoding is applied based on observed examples, though not explicitly in document text for the request payload)
  const doubleBase64Payload = Buffer.from(onceBase64, "utf8").toString("base64");

  // IV: base64(16-char ASCII IV) [cite: 95]
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

router.post("/create-order", async (req, res) => {
  try {
    const { user, plan, amount, clientReferenceId } = req.body;

    if (!user || !plan || !amount || !clientReferenceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if order already exists (prevent duplicates)
    const existing = await Payment.findOne({ clientReferenceId });
    if (existing) {
      return res.json({
        success: true,
        message: "Order already exists",
        orderId: existing._id,
      });
    }

    // Save initial order
    const newOrder = await Payment.create({
      user,
      plan,
      amount,
      clientReferenceId,   // 🔥 This MUST match VariantPay cTxnId
      status: "pending",   // Initial status
      method: "variantpay",
      currency: "INR",
    });

    return res.json({
      success: true,
      message: "Order created",
      orderId: newOrder._id,
    });

  } catch (err) {
    console.error("[VariantPay] create-order error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating order",
    });
  }
});

router.post("/initiate-transaction", async (req, res) => {
  try {
    const { amount, clientReferenceId, userDetails } = req.body;

    console.log("[VariantPay-HPP] Request received:", req.body);

    // Basic validation
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!clientReferenceId) {
      return res.status(400).json({
        success: false,
        message: "clientReferenceId is required",
      });
    }
    
    // userDetails.name and userDetails.mobile validation is technically optional for the
    // *initiation* step, but good practice. Keeping for safety, but the key fix is below.
    if (!userDetails || !userDetails.name) {
      return res.status(400).json({
        success: false,
        message: "userDetails.name is required",
      });
    }

    if (!userDetails.mobile) {
      return res.status(400).json({
        success: false,
        message: "userDetails.mobile is required",
      });
    }

    // ⭐ CORRECTION: Remove 'card_holder_name' to prevent the gateway from triggering 
    // the full API Direct Card validation which requires 'card_number', 'card_cvv', etc.
    // We only send the absolute minimum HPP initiation fields.
    const formData = new URLSearchParams();
    formData.append("reference_id", clientReferenceId); // [cite: 74, 99]
    formData.append("from_account", VARIANTPAY_CONFIG.FROM_ACCOUNT); // [cite: 74, 100]
    formData.append("transfer_amount", numericAmount.toFixed(2)); // "101.00" [cite: 74, 102]
    formData.append("transfer_type", VARIANTPAY_CONFIG.TRANSFER_TYPE); // "1" [cite: 74, 103]
    formData.append("currency_code", VARIANTPAY_CONFIG.CURRENCY_CODE); // "INR" [cite: 74, 101]
    // formData.append("card_holder_name", userDetails.name); // ❌ REMOVED THIS LINE

    console.log("[VariantPay-HPP] Posting to:", VARIANTPAY_CONFIG.INITIATE_URL);
    console.log("[VariantPay-HPP] Form data:", formData.toString());

    // Connection timeout set to 60 seconds as recommended [cite: 33]
    const axiosResponse = await axios.post(
      VARIANTPAY_CONFIG.INITIATE_URL,
      formData.toString(),
      {
        headers: {
          "client-id": VARIANTPAY_CONFIG.CLIENT_ID, // [cite: 70, 85]
          "fps3-api-key": VARIANTPAY_CONFIG.API_KEY, // [cite: 70, 85]
          "client-secret": VARIANTPAY_CONFIG.CLIENT_SECRET, // [cite: 70, 85]
          "service-secret": VARIANTPAY_CONFIG.SERVICE_SECRET, // [cite: 70, 85]
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        timeout: 60000,
      }
    );

    const vpResponse = axiosResponse.data;
    console.log("[VariantPay-HPP] Raw Response:", vpResponse);

    // HPP/documented purchase leg should return plain JSON with paymentLink
    // Success code is PG00000 [cite: 145, 162, 190]
    if (
      vpResponse.status === "SUCCESS" &&
      vpResponse.responseCode === "PG00000" &&
      vpResponse.paymentLink?.linkUrl
    ) {
      return res.json({
        success: true,
        redirectUrl: vpResponse.paymentLink.linkUrl, // Redirect URL for the HPP [cite: 63, 148]
        sanTxnId: vpResponse.sanTxnId,
        cTxnId: vpResponse.cTxnId,
      });
    }

    // Gateway returned a failure / validation error [cite: 163]
    console.error(
      "[VariantPay-HPP] Gateway FAILED:",
      vpResponse.status,
      vpResponse.responseCode,
      vpResponse.message
    );

    return res.status(400).json({
      success: false,
      message:
        vpResponse.message ||
        "VariantPay initiation failed. Check merchant configuration / request fields.",
      responseCode: vpResponse.responseCode,
      status: vpResponse.status,
      raw: vpResponse,
    });
  } catch (err) {
    console.error(
      "[VariantPay-HPP] Error calling VariantPay:",
      err.response?.status,
      err.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      message:
        err.response?.data?.message ||
        "Internal server error while contacting VariantPay",
    });
  }
});

router.post("/callback", async (req, res) => {
  try {
    console.log("[VariantPay-HPP] Callback received:", req.body);

    const callbackData = req.body;

    const {
      sanTxnId,
      status, // [cite: 189, 207]
      responseCode, // [cite: 190, 208]
      cTxnId, // [cite: 201, 218]
      amountDetails, // [cite: 197, 214]
      bankRefId, // [cite: 195, 212]
      message, // [cite: 191, 209]
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
    if (status === "SUCCESS" && responseCode === "PG00000") { // [cite: 189, 190, 162, 168]
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
    if (status === "FAILURE" && responseCode === "PG0000F") { // [cite: 207, 208, 163, 169]
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