import axios from "axios";

export const postToInstagram = async ({
  igBusinessId,
  accessToken,
  caption,
  imageUrl,
}) => {
  // 1️⃣ Create media container
  const mediaRes = await axios.post(
    `https://graph.facebook.com/v23.0/${igBusinessId}/media`,
    {
      image_url: imageUrl,
      caption,
    },
    {
      params: { access_token: accessToken },
    }
  );

  const creationId = mediaRes.data.id;

  // 2️⃣ Publish
  await axios.post(
    `https://graph.facebook.com/v23.0/${igBusinessId}/media_publish`,
    {
      creation_id: creationId,
    },
    {
      params: { access_token: accessToken },
    }
  );

  return true;
};
