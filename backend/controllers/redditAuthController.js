// backend/controllers/redditAuthController.js

import axios from "axios";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI;

// Step 1 - Redirect user to Reddit login
export const redditAuth = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).send("Missing token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const state = JSON.stringify({ id: decoded.id }); // store user ID safely

    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${REDDIT_CLIENT_ID}&response_type=code&state=${encodeURIComponent(
      state
    )}&redirect_uri=${REDDIT_REDIRECT_URI}&duration=permanent&scope=identity read submit flair modposts mysubreddits`;

    res.redirect(authUrl);
  } catch (err) {
    console.error("Reddit Auth Error:", err.message);
    res.status(500).send("Failed to initiate Reddit OAuth");
  }
};

// Step 2 - Callback from Reddit with code
export const redditCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("Missing code or state");

  let userId;
  try {
    const parsedState = JSON.parse(state);
    userId = parsedState.id;
  } catch {
    return res.status(400).send("Invalid state parameter");
  }

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDDIT_REDIRECT_URI,
      }),
      {
        auth: { username: process.env.REDDIT_CLIENT_ID, password: process.env.REDDIT_CLIENT_SECRET },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // Get Reddit user info
    const userRes = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Save tokens and username in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        redditAccessToken: access_token,
        redditRefreshToken: refresh_token,
        redditUsername: userRes.data.name,
      },
      { new: true }
    );

    if (!updatedUser) return res.status(400).send("User not found");

    // Slugify name to create dashboard URL
    const slugifiedName = updatedUser.name.trim().toLowerCase().replace(/\s+/g, "-");

    console.log("✅ Reddit tokens saved for user:", updatedUser.email);

    // Redirect to personalized frontend dashboard
    res.redirect(`http://localhost:3000/dashboard/${slugifiedName}`);

  } catch (err) {
    console.error("Reddit OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Reddit authentication failed");
  }
};


// Step 3 - Disconnect Reddit
export const disconnectReddit = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: {
        redditAccessToken: 1,
        redditRefreshToken: 1,
        redditUsername: 1,
      },
    });

    res.json({ message: "Reddit disconnected successfully" });
  } catch (err) {
    console.error("Error disconnecting Reddit:", err);
    res.status(500).json({ error: "Failed to disconnect Reddit" });
  }
};
