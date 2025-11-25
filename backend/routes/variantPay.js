// // file: backend/routes/variantPay.js
// import express from "express";
// import axios from "axios";
// import crypto from "crypto";

// import User from "../models/User.js"; 
// import Payment from "../models/Payment.js"; 
// import Plan from "../models/Plan.js";

// const router = express.Router();


// const VARIANTPAY_API_ENDPOINT = process.env.VARIANTPAY_API_ENDPOINT || "https://payments.variantpay.com/cbs/uni/initiate";
// const VARIANTPAY_HEADERS = {
//   'client-id': process.env.VARIANTPAY_CLIENT_ID,
//   'fps3-api-key': process.env.VARIANTPAY_API_KEY,
//   'client-secret': process.env.VARIANTPAY_CLIENT_SECRET,
//   'service-secret': process.env.VARIANTPAY_SERVICE_SECRET,
//   'accept': 'application/json',
//   'content-type': 'application/json',
// };

// router.post("/initiate-transaction", async (req, res) => {
//   try {
//     const { amount, clientReferenceId, userDetails } = req.body; 
//     const payload = {
//       reference_id: clientReferenceId, 
//       from_account: process.env.VARIANTPAY_FROM_ACCOUNT, 
//       transfer_amount: amount.toFixed(2), 
//       transfer_type: "1", 
//       currency_code: "INR", 
//       purpose_message: "Purchase Transaction", 
//       beneficiary_name: userDetails?.name, 
//       sender_mobile: userDetails?.mobile,
//       beneficiary_mobile: userDetails?.mobile,
//       to_account: process.env.VARIANTPAY_TO_ACCOUNT,
//       bank_id: process.env.VARIANTPAY_BANK_ID, 
//     };

//     const response = await axios.post(VARIANTPAY_API_ENDPOINT, payload, { 
//         headers: VARIANTPAY_HEADERS,
//         timeout: 60000, 
//     });

//     const responseData = response.data;
//     if (responseData.status === "SUCCESS" && responseData.responseCode === "PG00000") {
      
//       const paymentLink = responseData.paymentLink?.linkUrl; 

//       if (!paymentLink) {
//          throw new Error("VariantPay initiation successful but no payment link returned.");
//       }

//       console.log("VariantPay Initiation SUCCESS:", responseData.sanTxnId);
//       res.json({
//         success: true,
//         sanTxnId: responseData.sanTxnId,
//         redirectUrl: paymentLink,
//         cTxnId: responseData.cTxnId
//       });

//     } else {
//       console.error("VariantPay Initiation FAILED:", responseData);
//       res.status(500).json({ 
//         success: false, 
//         message: responseData.message || "VariantPay initiation failed",
//         errorCode: responseData.responseCode
//       });
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response) {
//       console.error("VariantPay API Error Response Status:", error.response.status);
//       console.error("VariantPay API Error Response Data:", error.response.data); 
//     } else {
//       console.error("Initiate transaction non-Axios error:", error.message);
//     }
//     res.status(500).json({ message: "Error initiating VariantPay transaction. Check backend logs for E-Code." });
//   }
// });

// router.post("/callback", async (req, res) => { 
//   const callbackData = req.body; 
//   console.log("VariantPay Callback Received:", callbackData);

//   const { sanTxnId, status, responseCode, cTxnId, amount, bankReferenceNumber } = callbackData;
//   const tempUserId = "USER_ID_FROM_DB"; 
//   const tempPlanId = "PLAN_ID_FROM_DB"; 
//   const tempBillingType = "yearly"; 
//   const tempAmount = amount; 

//   if (!tempUserId || !tempPlanId) {
//     console.error(`Callback: Cannot find order for cTxnId: ${cTxnId}`);
//     return res.status(200).send("Order not found, acknowledged."); 
//   }

//   try {
//       if (status === "SUCCESS" && responseCode === "PG00000") {
//         console.log(`Payment SUCCESS for cTxnId: ${cTxnId}, sanTxnId: ${sanTxnId}`);
        
//         const plan = await Plan.findById(tempPlanId);
//         if (!plan) throw new Error("Plan not found");

//         const oneYear = 365 * 24 * 60 * 60 * 1000;
//         const validUntil = new Date(Date.now() + oneYear);

//         await Payment.create({
//             user: tempUserId,
//             plan: tempPlanId,
//             amount: tempAmount, 
//             status: "active",
//             method: "variantpay",
//             PaymentId: sanTxnId,
//             validUntil: validUntil,
//             currency: "INR", 
//         });

//         await User.findByIdAndUpdate(tempUserId, {
//             subscriptionPlan: tempPlanId,
//             subscriptionStatus: "active",
//             nextBillingDate: validUntil,
//         });

//       } else if (status === "FAILURE" && responseCode === "PG0000F") {
//         console.log(`Payment FAILURE for cTxnId: ${cTxnId}`);
//         await Payment.create({
//             user: tempUserId,
//             plan: tempPlanId,
//             amount: tempAmount,
//             status: "failed",
//             method: "variantpay",
//             PaymentId: sanTxnId,
//             currency: "INR", 
//         });
//       } else {
//         console.warn(`Unusual status (${status}) received for cTxnId: ${cTxnId}`);
//       }
//   } catch (error) {
//       console.error("Error processing VariantPay callback:", error);
//   }

//   res.status(200).send("OK");
// });

// export default router;

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

// ---- AES helpers ----
function encryptPayload(jsonString) {
  if (!KEY_BUFFER) {
    throw new Error("VariantPay secret key not configured");
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY_BUFFER, iv);

  let encrypted = cipher.update(jsonString, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    payload: encrypted,
    iv: iv.toString("base64"),
  };
}

function decryptPayload(payloadBase64, ivBase64) {
  if (!KEY_BUFFER) {
    throw new Error("VariantPay secret key not configured");
  }

  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY_BUFFER, iv);

  let decrypted = decipher.update(payloadBase64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// ---------------------------------------------------------------------
//  POST /variantpay/initiate-transaction
//  -> called from your CheckoutPage on "Proceed to Pay"
//  -> returns { success, redirectUrl, sanTxnId, cTxnId }
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
//  POST /payments/initiate-transaction
//  -> called from CheckoutPage on "Proceed to Pay"
// ---------------------------------------------------------------------
router.post("/initiate-transaction", async (req, res) => {
  try {
    const { amount, clientReferenceId, userDetails } = req.body;

    console.log("[VariantPay] Incoming initiate-transaction body:", req.body);

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

    if (!userDetails || !userDetails.mobile) {
      return res.status(400).json({
        success: false,
        message: "userDetails.mobile is required",
      });
    }

    if (!KEY_BUFFER || KEY_BUFFER.length !== 32) {
      console.error(
        "[VariantPay] Secret key invalid or missing. Length:",
        KEY_BUFFER?.length
      );
      return res.status(500).json({
        success: false,
        message: "VariantPay secret key misconfigured on server",
      });
    }

    // 1) Build payload according to Payment Gateway doc
    const payloadData = {
      reference_id: clientReferenceId,
      from_account: VARIANTPAY_CONFIG.FROM_ACCOUNT,
      currency_code: VARIANTPAY_CONFIG.CURRENCY_CODE,
      transfer_amount: numericAmount.toFixed(2), // "100.00"
      transfer_type: VARIANTPAY_CONFIG.TRANSFER_TYPE, // "1" fixed

      // required in direct API; for HPP this will be used as card holder name
      card_holder_name: userDetails.name || clientReferenceId,

      purpose_message: `Skeylet subscription for ${clientReferenceId}`,

      // extra meta (not in doc but harmless)
      customer_mobile: userDetails.mobile,
    };

    const jsonPayload = JSON.stringify(payloadData);
    console.log("[VariantPay] Plain payload:", jsonPayload);

    // 2) Encrypt payload using AES-256-CBC
    const { payload: encryptedPayload, iv } = encryptPayload(jsonPayload);

    console.log("[VariantPay] Encrypted payload + IV prepared");

    // 3) Build multipart/form-data body
    // Using URLSearchParams WAS okay for some APIs, but the doc explicitly shows --form (multipart)
    const formData = new URLSearchParams();
    formData.append("payload", encryptedPayload);
    formData.append("iv", iv);

    console.log(
      "[VariantPay] Hitting VariantPay at:",
      VARIANTPAY_CONFIG.INITIATE_URL
    );

    let vpResponse;
    try {
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
          timeout: 60_000,
        }
      );
      vpResponse = axiosResponse.data;
    } catch (axiosErr) {
      console.error(
        "[VariantPay] Axios error calling gateway:",
        axiosErr.response?.status,
        axiosErr.response?.data || axiosErr.message
      );
      return res.status(502).json({
        success: false,
        message:
          axiosErr.response?.data?.message ||
          "Could not reach VariantPay gateway. Check headers / endpoint / IP whitelisting.",
      });
    }

    console.log("[VariantPay] Raw gateway response:", vpResponse);

    // 5) Validate & decrypt VariantPay response
    if (!vpResponse.payload || !vpResponse.iv) {
      console.error("[VariantPay] Unexpected response (no payload/iv):", vpResponse);
      return res.status(502).json({
        success: false,
        message:
          vpResponse.message ||
          "VariantPay returned unexpected response. No encrypted payload.",
      });
    }

    let decryptedText;
    try {
      decryptedText = decryptPayload(vpResponse.payload, vpResponse.iv);
    } catch (decErr) {
      console.error("[VariantPay] Decryption failed:", decErr.message);
      return res.status(500).json({
        success: false,
        message:
          "Failed to decrypt VariantPay response. Check VARIANTPAY_SECRET_KEY matches their portal.",
      });
    }

    console.log("[VariantPay] Decrypted raw response:", decryptedText);

    let decrypted;
    try {
      decrypted = JSON.parse(decryptedText);
    } catch (parseErr) {
      console.error("[VariantPay] JSON parse failed on decrypted text:", parseErr.message);
      return res.status(500).json({
        success: false,
        message:
          "VariantPay response not valid JSON after decryption. Verify encryption key and integration mode.",
      });
    }

    console.log("[VariantPay] Decrypted response object:", decrypted);

    // 6) Success -> return payment link to frontend
    if (
      decrypted.status === "SUCCESS" &&
      decrypted.responseCode === "PG00000" &&
      decrypted.paymentLink?.linkUrl
    ) {
      return res.json({
        success: true,
        redirectUrl: decrypted.paymentLink.linkUrl,
        sanTxnId: decrypted.sanTxnId,
        cTxnId: decrypted.cTxnId,
      });
    }

    // 7) Failure from gateway (but decrypted correctly)
    console.error("[VariantPay] Initiation FAILED at gateway:", decrypted);
    return res.status(400).json({
      success: false,
      message: decrypted.message || "VariantPay initiation failed",
      responseCode: decrypted.responseCode,
      status: decrypted.status,
    });
  } catch (err) {
    console.error("[VariantPay] initiate-transaction UNEXPECTED error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during VariantPay payment initiation",
    });
  }
});


// ---------------------------------------------------------------------
//  POST /variantpay/callback
//  -> VariantPay will call this after final transaction status
//  -> You must share this URL with their support team
// ---------------------------------------------------------------------
router.post("/callback", async (req, res) => {
  const callbackData = req.body;
  console.log("[VariantPay] Callback received:", callbackData);
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
    amountDetails?.amount || amountDetails?.originalAmount || null;

  // TODO: replace with your real lookup:
  const tempUserId = "USER_ID_FROM_DB_FOR_" + cTxnId;
  const tempPlanId = "PLAN_ID_FROM_DB_FOR_" + cTxnId;
  const tempBillingType = "yearly";

  if (!tempUserId || !tempPlanId) {
    console.error(
      `[VariantPay] Callback: cannot map cTxnId ${cTxnId} to user/plan`
    );
    return res.status(200).send("Order not found, acknowledged.");
  }

  try {
    if (status === "SUCCESS" && responseCode === "PG00000") {
      console.log(
        `[VariantPay] Payment SUCCESS for cTxnId=${cTxnId}, sanTxnId=${sanTxnId}`
      );

      const plan = await Plan.findById(tempPlanId);
      if (!plan) throw new Error("Plan not found");

      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const validUntil = new Date(Date.now() + oneYearMs);

      await Payment.create({
        user: tempUserId,
        plan: tempPlanId,
        amount: amount ? Number(amount) : undefined,
        status: "active",
        method: "variantpay",
        PaymentId: sanTxnId,
        validUntil,
        currency: "INR",
        gatewayMeta: {
          bankRefId,
          message,
        },
      });

      await User.findByIdAndUpdate(tempUserId, {
        subscriptionPlan: tempPlanId,
        subscriptionStatus: "active",
        nextBillingDate: validUntil,
      });
    } else if (status === "FAILURE" && responseCode === "PG0000F") {
      console.warn(
        `[VariantPay] Payment FAILURE for cTxnId=${cTxnId}, sanTxnId=${sanTxnId}, message=${message}`
      );

      await Payment.create({
        user: tempUserId,
        plan: tempPlanId,
        amount: amount ? Number(amount) : undefined,
        status: "failed",
        method: "variantpay",
        PaymentId: sanTxnId,
        currency: "INR",
        gatewayMeta: {
          bankRefId,
          message,
        },
      });
    } else {
      console.warn(
        `[VariantPay] Unusual status in callback: status=${status}, responseCode=${responseCode}, cTxnId=${cTxnId}`
      );
    }
  } catch (err) {
    console.error("[VariantPay] Error processing callback:", err);
    // still respond 200 so gateway doesn't keep retrying forever
  }

  res.status(200).send("OK");
});

export default router;
