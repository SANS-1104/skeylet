// backend/utils/postToFacebook.js
// import axios from "axios";

// export const postToFacebook = async (pages, { title, content, image }) => {
//   const results = [];

//   for (const page of pages) {
//     try {
//       const pageAccessToken = page.accessToken;
//       const pageId = page.pageId;
//       let postUrl = `https://graph.facebook.com/${pageId}/feed`;

//       const payload = {
//         message: `${title}\n\n${content}`,
//         access_token: pageAccessToken,
//       };

//       // 🔹 Handle image posts if present
//       if (image) {
//         const imageResponse = await axios.post(
//           `https://graph.facebook.com/${pageId}/photos`,
//           {
//             url: image,
//             caption: `${title}\n\n${content}`,
//             access_token: pageAccessToken,
//           }
//         );

//         results.push({
//           pageId,
//           pageName: page.pageName,
//           postId: imageResponse.data.id,
//           url: `https://www.facebook.com/${imageResponse.data.id}`,
//         });
//       } else {
//         const response = await axios.post(postUrl, payload);
//         results.push({
//           pageId,
//           pageName: page.pageName,
//           postId: response.data.id,
//           url: `https://www.facebook.com/${response.data.id}`,
//         });
//       }
//     } catch (error) {
//       console.error(`❌ Failed posting to ${page.pageName}:`, error.response?.data || error.message);
//       results.push({
//         pageId: page.pageId,
//         pageName: page.pageName,
//         error: error.response?.data || error.message,
//       });
//     }
//   }

//   return results;
// };


// backend/utils/postToFacebook.js
import axios from "axios";
import FormData from "form-data";

export const postToFacebook = async (pages, { title, content, image }) => {
  const results = [];

  for (const page of pages) {
    try {
      const { accessToken: pageAccessToken, pageId, pageName } = page;

      // If image is present
      if (image) {
        const caption = `${title || ""}\n\n${content || ""}`;
        let imageResponse;

        // 🔹 CASE 1: image is base64 (data:image/...;base64,...)
        if (image.startsWith("data:image")) {
          const formData = new FormData();
          const base64Data = image.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          formData.append("source", buffer, { filename: "image.jpg" });
          formData.append("caption", caption);
          formData.append("access_token", pageAccessToken);

          imageResponse = await axios.post(
            `https://graph.facebook.com/${pageId}/photos`,
            formData,
            { headers: formData.getHeaders() }
          );
        }
        // 🔹 CASE 2: image is a public URL
        else {
          imageResponse = await axios.post(
            `https://graph.facebook.com/${pageId}/photos`,
            {
              url: image,
              caption,
              access_token: pageAccessToken,
            }
          );
        }

        results.push({
          pageId,
          pageName,
          postId: imageResponse.data.id,
          url: `https://www.facebook.com/${imageResponse.data.id}`,
          status: "posted_with_image",
        });
      }

      // If no image, post text content only
      else {
        const postResponse = await axios.post(
          `https://graph.facebook.com/${pageId}/feed`,
          {
            message: `${title || ""}\n\n${content || ""}`,
            access_token: pageAccessToken,
          }
        );

        results.push({
          pageId,
          pageName,
          postId: postResponse.data.id,
          url: `https://www.facebook.com/${postResponse.data.id}`,
          status: "posted_text_only",
        });
      }
    } catch (error) {
      console.error(`❌ Failed posting to ${page.pageName}:`, error.response?.data || error.message);
      results.push({
        pageId: page.pageId,
        pageName: page.pageName,
        error: error.response?.data || error.message,
        status: "failed",
      });
    }
  }

  return results;
};
