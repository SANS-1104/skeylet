// import express from "express";
// import axios from "axios";
// import crypto from "crypto";
// import FormData from "form-data";

// const router = express.Router();

// const VARIANT_URL = "https://payments.variantpay.com/cbs/ccs/initiate";

// // ENV Vars
// const CLIENT_ID = process.env.VARIANTPAY_CLIENT_ID;
// const API_KEY = process.env.VARIANTPAY_API_KEY;
// const CLIENT_SECRET = process.env.VARIANTPAY_CLIENT_SECRET;
// const SERVICE_SECRET = process.env.VARIANTPAY_SERVICE_SECRET;
// const SECRET_KEY = process.env.VARIANTPAY_SECRET_KEY; // EXACT secret key from portal
// const FROM_ACCOUNT = process.env.VARIANTPAY_FROM_ACCOUNT;

// console.log("SECRET KEY FROM ENV:", SECRET_KEY);
// console.log("KEY LENGTH:", SECRET_KEY.length);

// /* --------------------------------------------------------
//  * FIX 1 → PHP-Compatible uniqid() + sha256 IV
//  * --------------------------------------------------------
//  */
// function generatePhpCompatibleIV() {
//   const uniqid = Date.now().toString(16) + Math.random().toString().slice(2);
//   const sha = crypto.createHash("sha256").update(uniqid).digest("hex");
//   const ivStr = sha.substring(0, 16); // EXACT like PHP
//   return Buffer.from(ivStr, "utf8");  // ASCII IV
// }

// /* --------------------------------------------------------
//  * FIX 2 → Use RAW 32-byte SECRET KEY (not hashed)
//  * --------------------------------------------------------
//  */
// function encryptPayload(data) {
//   const key = Buffer.from(SECRET_KEY, "utf8");
//   const iv = generatePhpCompatibleIV();

//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//   let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
//   encrypted += cipher.final("base64");

//   return {
//     payload: encrypted,
//     iv: iv.toString("base64")
//   };
// }

// function decryptVariantPayResponse(resp) {
//   const key = Buffer.from(SECRET_KEY, "utf8");
//   const ivBuf = Buffer.from(resp.iv, "base64");

//   const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuf);
//   let decrypted = decipher.update(resp.payload, "base64", "utf8");
//   decrypted += decipher.final("utf8");

//   return JSON.parse(decrypted);
// }

// /* ======================================================
//  * 👉 LEG 1: Create Payment Link
//  * ======================================================
//  */

// router.post("/create-payment", async (req, res) => {
//   try {
//     const { amount, name, mobile } = req.body;

//     const reference_id = "SKEYLET_" + Date.now();

//     const payloadData = {
//       reference_id,
//       from_account: FROM_ACCOUNT,
//       currency_code: "INR",
//       transfer_amount: Number(amount).toFixed(2),
//       transfer_type: "1",

//       // Hosted Page → card fields must stay empty
//       card_number: "4111111111111111",
//       card_expiry_month: "12",
//       card_expiry_year: "2030",
//       card_cvv: "123",
//       card_holder_name: name || "Test User",

//       purpose_message: "Skeylet Subscription"
//     };

//     // Encrypt the payload
//     const encrypted = encryptPayload(payloadData);

//     // Create multipart/form-data request
//     const form = new FormData();
//     form.append("payload", encrypted.payload);
//     form.append("iv", encrypted.iv);

//     // Send request to VariantPay
//     const gatewayRes = await axios.post(VARIANT_URL, form, {
//       headers: {
//         ...form.getHeaders(), // crucial for multipart/form-data
//         "client-id": CLIENT_ID,
//         "fps3-api-key": API_KEY,
//         "client-secret": CLIENT_SECRET,
//         "service-secret": SERVICE_SECRET,
//       },
//     });

//     // Decrypt the response
//     const decrypted = decryptVariantPayResponse(gatewayRes.data);

//     if (decrypted.status !== "SUCCESS") {
//       return res.status(400).json({
//         success: false,
//         message: decrypted.message,
//       });
//     }

//     return res.json({
//       success: true,
//       paymentLink: decrypted.paymentLink.linkUrl,
//       referenceId: reference_id,
//     });

//   } catch (err) {
//     console.error("VariantPay error:", err.response?.data || err);
//     return res.status(500).json({
//       success: false,
//       message: "Payment initiation failed",
//     });
//   }
// });


// /* ======================================================
//  * 👉 LEG 2: FRONTEND REDIRECT (Browser)
//  *    https://api.skeylet.com/api/variantpay/callback?sanTxnId=..&status=..
//  * ======================================================
//  */
// router.get("/callback", async (req, res) => {
//   try {
//     const { sanTxnId, status } = req.query;

//     if (!sanTxnId) {
//       return res.status(400).send("Missing sanTxnId");
//     }

//     // Redirect the user back to frontend UI
//     return res.redirect(
//       `https://skeylet.com/payment-status?sanTxnId=${sanTxnId}&status=${status}`
//     );

//   } catch (err) {
//     console.error("Callback error:", err);
//     return res.status(500).send("Callback handling failed");
//   }
// });


// /* ======================================================
//  * 👉 LEG 3: SERVER-TO-SERVER WEBHOOK
//  * Hit directly by VariantPay backend → must decrypt
//  * ======================================================
//  */
// router.post("/webhook", async (req, res) => {
//   try {
//     const { payload, iv } = req.body;

//     if (!payload || !iv) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing payload/iv"
//       });
//     }

//     const decrypted = decryptVariantPayResponse({ payload, iv });

//     console.log("🔔 WEBHOOK RECEIVED:", decrypted);

//     const {
//       sanTxnId,
//       status,
//       message,
//       reference_id,
//       transfer_amount,
//     } = decrypted;

//     if (status === "SUCCESS") {
//       console.log("💰 Payment SUCCESS:", sanTxnId);

//       // TODO: update your DB here
//       // await Payment.updateOne({ reference_id }, { status: "SUCCESS" });

//       // TODO: enable subscription
//       // await User.updateOne({ userId }, { planActive: true });

//     } else {
//       console.log("❌ Payment FAILED:", sanTxnId, message);

//       // await Payment.updateOne({ reference_id }, { status: "FAILED" });
//     }

//     return res.json({ success: true });

//   } catch (err) {
//     console.error("Webhook ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Webhook processing failed"
//     });
//   }
// });


// export default router;



// import axios from "axios";
// import crypto from "crypto";

// const apiUrl = process.env.VARIANTPAY_API_ENDPOINT || "https://payments.variantpay.com/cbs/ccs/initiate";

// // Headers
// const headers = {
//     "client-id": process.env.VARIANTPAY_CLIENT_ID,
//     "fps3-api-key": process.env.VARIANTPAY_API_KEY,
//     "client-secret": process.env.VARIANTPAY_CLIENT_SECRET,
//     "service-secret": process.env.VARIANTPAY_SERVICE_SECRET,
//     "Content-Type": "application/json"
// };
// const secretKey = process.env.VARIANTPAY_SECRET_KEY


// // Step 2: AES-256-CBC Encrypt
// function encryptAES(data, key) {
//     const iv = crypto.randomBytes(16); // Same effect as PHP generated IV
//     const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);

//     let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
//     encrypted += cipher.final("base64");

//     return {
//         payload: encrypted,
//         iv: iv.toString("base64")
//     };
// }

// // Step 3: Encrypt Payload
// const encrypted = encryptAES(payload, secretKey);

// // Step 4: Send POST Request
// (async () => {
//     try {
//         const response = await axios.post(apiUrl, encrypted, {
//             headers: headers
//         });

//         const resp = response.data;

//         if (!resp.payload || !resp.iv) {
//             console.error("Invalid Response:", resp);
//             return;
//         }

//         // Step 5: Decrypt Response
//         const decrypted = decryptAES(resp.payload, resp.iv, secretKey);
//         console.log("\nOK Decrypted Response From VariantPay:\n");
//         console.log(JSON.parse(decrypted));

//     } catch (err) {
//         console.error("Request Error:", err.message);
//     }
// })();

// // Step 6: AES-256-CBC Decrypt
// function decryptAES(base64Payload, base64Iv, key) {
//     const encrypted = Buffer.from(base64Payload, "base64");
//     const iv = Buffer.from(base64Iv, "base64");

//     const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);

//     let decrypted = decipher.update(encrypted, "base64", "utf8");
//     decrypted += decipher.final("utf8");

//     return decrypted;
// }


// // Step 1: Payload
// const payload = {
//     reference_id: "ANG20250125020273",
//     from_account: process.env.VARIANTPAY_FROM_ACCOUNT,
//     currency_code: "INR",
//     transfer_amount: "10.00",
//     transfer_type: "1",
//     card_number: "4375518293306023",
//     card_expiry_month: "11",
//     card_expiry_year: "29",
//     card_cvv: "360",
//     card_holder_name: "Manmeet Kumar Yadav",
//     purpose_message: "Payment test"
// };



// router.post("/create-payment", async (req, res) => {
//   try {
//     const { amount, name, mobile } = req.body;

//     const reference_id = "SKEYLET_" + Date.now();

//     const payloadData = {
//     reference_id: "ANG20250125020273",
//     from_account: process.env.VARIANTPAY_FROM_ACCOUNT,
//     currency_code: "INR",
//     transfer_amount: "10.00",
//     transfer_type: "1",
//     card_number: "4375518293306023",
//     card_expiry_month: "11",
//     card_expiry_year: "29",
//     card_cvv: "360",
//     card_holder_name: "Manmeet Kumar Yadav",
//     purpose_message: "Payment test"
// };

//     // Encrypt the payload
//     const encrypted = encryptPayload(payloadData);

//     // Create multipart/form-data request
//     const form = new FormData();
//     form.append("payload", encrypted.payload);
//     form.append("iv", encrypted.iv);

//     // Send request to VariantPay
//     const gatewayRes = await axios.post(VARIANT_URL, form, {
//       headers: headers
//     });

//     // Decrypt the response
//     const decrypted = decryptVariantPayResponse(gatewayRes.data);

//     if (decrypted.status !== "SUCCESS") {
//       return res.status(400).json({
//         success: false,
//         message: decrypted.message,
//       });
//     }

//     return res.json({
//       success: true,
//       paymentLink: decrypted.paymentLink.linkUrl,
//       referenceId: reference_id,
//     });

//   } catch (err) {
//     console.error("VariantPay error:", err.response?.data || err);
//     return res.status(500).json({
//       success: false,
//       message: "Payment initiation failed",
//     });
//   }
// });



import express from "express";
import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";




const router = express.Router();

// ---------------------- VariantPay Config ----------------------
const apiUrl =
  process.env.VARIANTPAY_API_ENDPOINT ||
  "https://payments.variantpay.com/cbs/ccs/initiate";

const headers = {
  "client-id": process.env.VARIANTPAY_CLIENT_ID,
  "fps3-api-key": process.env.VARIANTPAY_API_KEY,
  "client-secret": process.env.VARIANTPAY_CLIENT_SECRET,
  "service-secret": process.env.VARIANTPAY_SERVICE_SECRET,
  "Content-Type": "application/json",
};

const secretKey = process.env.VARIANTPAY_SECRET_KEY;

function encryptAES_PHP_STYLE(data, key) {
  // iv: 16 raw bytes
  const iv = crypto.randomBytes(16);

  // Create cipher; ask for base64 output (this gives "base64-text" like PHP's openssl_encrypt default)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);
  let encryptedBase64Text = cipher.update(JSON.stringify(data), "utf8", "base64");
  encryptedBase64Text += cipher.final("base64");

  // Double-base64 in PHP means base64-encoding the ASCII base64 text bytes.
  // So we encode the base64 text as UTF-8 bytes and base64 those bytes.
  const doubleBase64Payload = Buffer.from(encryptedBase64Text, "utf8").toString("base64");

  return {
    payload: doubleBase64Payload,
    iv: iv.toString("base64")
  };
}

/**
 * decryptAES (robust)
 * - Tries single base64 decode + decrypt (most common)
 * - If that fails, tries double base64 decode (handles PHP double-base64 responses)
 *
 * Returns decrypted JSON string (caller should JSON.parse it).
 */
function decryptAES(payloadB64, ivB64, key) {
  if (!payloadB64 || !ivB64) {
    throw new Error("Missing payload or iv");
  }

  const iv = Buffer.from(ivB64, "base64");
  if (iv.length !== 16) {
    throw new Error("Invalid IV length: " + iv.length);
  }

  // helper to attempt decrypting a Buffer of raw cipher bytes
  function attemptDecrypt(rawBuffer) {
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);
      const out = Buffer.concat([decipher.update(rawBuffer), decipher.final()]);
      return out.toString("utf8");
    } catch (e) {
      return false;
    }
  }

  // 1) Single decode attempt (payload is base64 of raw cipher bytes)
  try {
    const singleDecoded = Buffer.from(payloadB64, "base64"); // yields raw bytes OR yields the "base64-text" bytes (if double encoded)
    let res = attemptDecrypt(singleDecoded);
    if (res !== false) return res;

    // 2) Double-decode attempt:
    // If singleDecoded actually contains ASCII base64 text (because server double-encoded),
    // convert to string and base64-decode that text to raw cipher bytes, then decrypt.
    const asText = singleDecoded.toString("utf8");
    // safety: ensure it looks like base64 (basic check)
    if (/^[A-Za-z0-9+/= \r\n\t]+$/.test(asText)) {
      try {
        const doubleDecoded = Buffer.from(asText, "base64");
        res = attemptDecrypt(doubleDecoded);
        if (res !== false) return res;
      } catch (e) {
        // fallthrough to error
      }
    }
  } catch (e) {
    // fall through to throw below
  }

  throw new Error("Decryption failed (invalid key/iv or wrong payload encoding)");
}

// ===================================================================
//                     🚀 CREATE PAYMENT API
// ===================================================================

router.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, mobile } = req.body;

    const reference_id = "SKEYLET_" + Date.now();

    // -------- Dummy test card payload --------
    const payloadData = {
      reference_id,
      from_account: process.env.VARIANTPAY_FROM_ACCOUNT,
      currency_code: "INR",
      transfer_amount: Number(amount).toFixed(2),
      transfer_type: "1",

      // Dummy Card
      card_number: "4375518860306023",
      card_expiry_month: "12",
      card_expiry_year: "27",
      card_cvv: "359",
      card_holder_name: name || "Test User",

      purpose_message: "Payment test",
    };

    // Encrypt payload
    const encrypted = encryptAES_PHP_STYLE(payloadData, secretKey);

    // Prepare form-data
    const form = new FormData();
    form.append("payload", encrypted.payload);
    form.append("iv", encrypted.iv);

    // Send request to VariantPay
    const gatewayRes = await axios.post(apiUrl, encrypted, {
      headers: headers,
      timeout: 15000
    });

    const resp = gatewayRes.data;

    if (!resp.payload || !resp.iv) {
      return res.status(400).json({
        success: false,
        message: "Invalid response from VariantPay",
      });
    }

    // Decrypt response
    const decrypted = decryptAES(resp.payload, resp.iv, secretKey);

    console.log("DECRYPTED RESPONSE:", decrypted);

    // Handle failure
    if (decrypted.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: decrypted.message || "Payment failed",
      });
    }

    // Success
    return res.json({
      success: true,
      referenceId: reference_id,
      paymentLink: decrypted.paymentLink?.linkUrl,
    });
  } catch (err) {
    console.error("VariantPay error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
    });
  }
});

export default router;
