// backend/utils/postToReddit.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

/* 🔹 Refresh Reddit access token (same as before) */
export const refreshRedditToken = async (user) => {
  try {
    const auth = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString("base64");

    const res = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: user.redditRefreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newToken = res.data.access_token;
    user.redditAccessToken = newToken;
    await user.save();
    return newToken;
  } catch (err) {
    console.error("❌ Failed to refresh Reddit token:", err.response?.data || err.message);
    return null;
  }
};

// 🔹 Submit post (supports text, link, and image)
export const postToSubreddit = async (
  accessToken,
  redditUsername,
  subreddit,
  title,
  content,
  image,
  flairId
) => {
  try {
    // 1️⃣ Determine post kind
    let kind = "self";
    if (image) kind = "image";

    // 2️⃣ Upload image if present
    let mediaId = null;
    if (image) {
      const uploadInit = await axios.post(
        "https://oauth.reddit.com/api/media/asset.json",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": `web:com.linkgen.autoposter:v1.0.0 (by /u/${redditUsername})`,
          },
        }
      );

      const { upload_url, asset } = uploadInit.data.args;
      const blob = await fetch(image).then((r) => r.blob());

      // Upload image to Reddit's storage
      await axios.put(upload_url, blob, {
        headers: { "Content-Type": blob.type },
      });

      mediaId = asset.asset_id;
    }

    // 3️⃣ Get flairs (if any)
    if (!flairId) {
      const flairs = await getSubredditFlairs(
        subreddit,
        accessToken,
        redditUsername
      );
      flairId = flairs.length ? flairs[0].id : null;
    }

    // 4️⃣ Submit post
    const params = new URLSearchParams({
      sr: subreddit,
      title,
      api_type: "json",
      kind,
    });

    if (flairId) params.append("flair_id", flairId);
    if (kind === "self") params.append("text", content);
    if (kind === "image" && mediaId) params.append("media_ids", mediaId);

    const response = await axios.post(
      "https://oauth.reddit.com/api/submit",
      params,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": `AutoPost/1.0.0 by u/${redditUsername}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const errors = response.data.json?.errors;
    if (errors?.length) throw new Error(JSON.stringify(errors));

    return response.data.json?.data || response.data;
  } catch (err) {
    console.error(
      `❌ Failed to post in r/${subreddit}:`,
      err.response?.data || err.message
    );
    throw err;
  }
};

/* 🔹 Fetch subreddit flairs (same as before) */
export const getSubredditFlairs = async (subreddit, accessToken, redditUsername) => {
  try {
    const res = await axios.get(
      `https://oauth.reddit.com/r/${subreddit}/api/link_flair_v2`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": `web:com.linkgen.autoposter:v1.0.0 (by /u/${redditUsername})`,
        },
      }
    );
    return res.data.map((f) => ({ id: f.id, text: f.text }));
  } catch (err) {
    console.warn(`⚠️ Could not fetch flairs for r/${subreddit}:`, err.response?.data || err.message);
    return [];
  }
};
