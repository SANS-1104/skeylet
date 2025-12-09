import axios from "axios";

export const postToInstagram = async (user, post) => {
  try {
    const { instagramBusinessAccountId, instagramAccessToken } = user;

    if (!instagramBusinessAccountId || !instagramAccessToken) {
      throw new Error("Instagram not connected");
    }

    // 1️⃣ Upload media to container
    const mediaRes = await axios.post(
      `https://graph.facebook.com/v20.0/${instagramBusinessAccountId}/media`,
      {
        image_url: post.image,
        caption: post.content,
      },
      {
        params: { access_token: instagramAccessToken },
      }
    );

    const creationId = mediaRes.data.id;

    // 2️⃣ Publish the container
    const publishRes = await axios.post(
      `https://graph.facebook.com/v20.0/${instagramBusinessAccountId}/media_publish`,
      {
        creation_id: creationId,
      },
      {
        params: { access_token: instagramAccessToken },
      }
    );

    return {
      postId: publishRes.data.id,
      url: `https://instagram.com/${publishRes.data.id}`,
    };
  } catch (err) {
    console.error("❌ Instagram posting failed:", err.response?.data || err.message);
    throw new Error("Failed to post on Instagram");
  }
};
