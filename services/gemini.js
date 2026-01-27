import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import fetch from "node-fetch";
import "dotenv/config";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY5);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

// Function to fetch weather data
async function getWeather(latitude, longitude) {
  if (!latitude || !longitude) return null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Helper to convert file to generative part
async function fileToGenerativePart(path, mimeType) {
  // If path is a URL (Cloudinary), fetch it
  if (path.startsWith("http")) {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(arrayBuffer).toString("base64"),
          mimeType,
        },
      };
    } catch (error) {
      console.error("Error fetching image from URL:", error);
      throw new Error("Failed to fetch image from URL");
    }
  }
  // Local file fallback
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}

export const generateResponse = async ({
  history,
  message,
  imagePath,
  language,
  latitude,
  longitude,
}) => {
  let weatherData = null;
  try {
    if (latitude && longitude) {
      weatherData = await getWeather(latitude, longitude);
      console.log(weatherData)
    }

    let systemPrompt = `You are an intelligent AI assistant for a Smart Crop application. 
    Your goal is to assist farmers and users with agricultural queries, plant identification, and general questions.
    `;

    if (language) {
      systemPrompt += `\nPlease respond in ${language}.`;
    }

    if (weatherData) {
      systemPrompt += `\n\nCurrent Weather Context for location (${latitude}, ${longitude}):
      - Current Temp: ${weatherData.current.temperature_2m}${weatherData.current_units.temperature_2m}
      - Wind Speed: ${weatherData.current.wind_speed_10m}${weatherData.current_units.wind_speed_10m}
      - Weather Code: ${weatherData.current.weather_code} (WMO code)
      Use this weather information to provide better advice if relevant to the user's query (e.g., watering advice, pest control).`;
    }

    const chatHistory = history
      .filter((msg) => msg.content && msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.user === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
    });

    let result;
    if (imagePath) {
      const imagePart = await fileToGenerativePart(imagePath, "image/jpeg");
      const promptText =
        message && message.trim() !== ""
          ? message
          : "Here is an the plant image";
      result = await chat.sendMessage([promptText, imagePart]);
    } else {
      result = await chat.sendMessage(message);
    }

    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};

export const generateChatName = async (message, imagePath) => {
  try {
    let content;
    if (imagePath) {
      const imagePart = await fileToGenerativePart(imagePath, "image/jpeg");
      const promptText =
        message && message.trim() !== ""
          ? `Generate a very short, concise title (3-5 words max) for a chat that starts with this message: "${message}" and this image. Do not include quotes or special characters in the output.`
          : `Generate a very short, concise title (3-5 words max) for a chat that starts with this image. Do not include quotes or special characters in the output.`;
      content = [promptText, imagePart];
    } else {
      content = `Generate a very short, concise title (3-5 words max) for a chat that starts with this message: "${message}". Do not include quotes or special characters in the output.`;
    }

    const result = await model.generateContent(content);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Name Generation Error:", error);
    return "New Chat"; // Fallback
  }
};

export const identifyCropFromCloudinary = async (imageUrl) => {
  try {
    const prompt = `
You are an agricultural image classifier.

TARGET CROPS: [Wheat, Potato, Pepper, Orange, Maize, Apple]

TASK:
1. Analyze the uploaded image.
2. Determine if it is a leaf, fruit, or plant of one of the TARGET CROPS.
3. If it is one of them, return ONLY the crop name.
4. Otherwise return "INVALID".

OUTPUT FORMAT:
Return a single word string.
`;

    const response = await model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt },
            await fileToGenerativePart(imageUrl, "image/jpeg"),
          ],
        },
      ],
    });

    const text = response.response.text()?.trim() || "INVALID";

    const crops = ["Wheat", "Potato", "Pepper", "Orange", "Maize", "Apple"];
    for (const crop of crops) {
      if (text.toLowerCase().includes(crop.toLowerCase())) {
        return crop;
      }
    }

    return "INVALID";
  } catch (e) {
    console.error("Gemini Identification Error:", e);
    return "ERROR";
  }
};

