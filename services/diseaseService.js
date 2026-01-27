import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

const API_URL = "https://castled-renato-snakily.ngrok-free.dev/predictwithseverity";

export const getDiseasePrediction = async (imagePath) => {
  try {
    const formData = new FormData();

    if (imagePath.startsWith("http")) {
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error("Failed to fetch image from URL");
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") || "image/jpeg";

      formData.append("file", buffer, {
        filename: "image",
        contentType,
      });
    } else {
      formData.append("file", fs.createReadStream(imagePath));
    }

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Disease detection failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Disease prediction service error:", error);
    throw error;
  }
};
