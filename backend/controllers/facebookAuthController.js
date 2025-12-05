// backend/controllers/facebookAuthController.js

import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const FACEBOOK_OAUTH_URL = "https://www.facebook.com/v23.0/dialog/oauth";
const FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v23.0/oauth/access_token";
const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v23.0/me/accounts";

export const facebookAuth = (req, res) => {
  const { token } = req.query; // JWT from frontend

  const requiredScopes = [
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "pages_manage_metadata",
    "pages_manage_engagement",
    "pages_read_user_content",
    "public_profile",
    "email",
  ];

  const redirectUrl = `${FACEBOOK_OAUTH_URL}?client_id=${
    process.env.FACEBOOK_APP_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.FACEBOOK_REDIRECT_URI
  )}&scope=${requiredScopes.join(",")}&state=${token}`;

  res.redirect(redirectUrl);
};

export const facebookCallback = async (req, res) => {
  const { code, state } = req.query;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  try {
    // 🔹 Decode JWT
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 1️⃣ Exchange code for short-lived user token
    const tokenResponse = await axios.get(FACEBOOK_TOKEN_URL, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      },
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // 2️⃣ Exchange for long-lived token
    const longLivedResponse = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    const userAccessToken = longLivedResponse.data.access_token;

    // 3️⃣ Fetch managed pages (with name, id, and access_token)
    const pagesResponse = await axios.get(
      "https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token",
      {
        headers: { Authorization: `Bearer ${userAccessToken}` },
      }
    );

    const pages = pagesResponse.data.data || [];
    if (!pages.length) {
      return res.status(400).json({ message: "No Facebook Pages found." });
    }

    // ✅ Format and save page info (no extra API calls)
    const formattedPages = pages.map((p) => ({
      pageId: p.id,
      pageName: p.name,
      accessToken: p.access_token,
    }));

    // 4️⃣ Save to MongoDB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.facebookPages = formattedPages;
    user.facebookUserAccessToken = userAccessToken;
    user.autoPostFacebook = true;
    await user.save();

    console.log(`✅ Facebook connected with ${formattedPages.length} pages for user: ${user.email}`);
    res.redirect("https://skeylet.com/integrations?facebook=connected");
  } catch (err) {
    console.error("❌ Facebook Auth Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Facebook authentication failed" });
  }
};

export const disconnectFacebook = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.facebookPages = [];
    user.facebookUserAccessToken = undefined;
    user.autoPostFacebook = false;

    await user.save();

    res.json({ message: "Facebook disconnected successfully" });
  } catch (err) {
    console.error("Facebook Disconnect Error:", err);
    res.status(500).json({ error: "Failed to disconnect Facebook" });
  }
};

export const getFacebookPages = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ pages: user.facebookPages || [] });
  } catch (err) {
    console.error("Error fetching Facebook pages:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateFacebookPreferences = async (req, res) => {
  try {
    const userId = req.user._id; // from authenticateUser middleware
    const { autoPostFacebook } = req.body;

    if (typeof autoPostFacebook !== "boolean") {
      return res.status(400).json({ error: "Invalid value for autoPostFacebook" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { autoPostFacebook },
      { new: true }
    ).select("autoPostFacebook");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `Facebook auto-post ${autoPostFacebook ? "enabled" : "disabled"} successfully`,
      autoPostFacebook: user.autoPostFacebook,
    });
  } catch (error) {
    console.error("❌ Error updating Facebook preferences:", error);
    res.status(500).json({ error: "Failed to update Facebook preferences" });
  }
};
