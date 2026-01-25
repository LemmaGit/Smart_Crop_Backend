import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    // model: "gemini-1.5-flash" 
    // model: "gemini-1.5-pro"
    // model: "gemini-pro"
    model: "gemini-2.5-flash-lite"
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
    try {
        // 1. Fetch Weather Data
        let weatherData = null;
        if (latitude && longitude) {
            weatherData = await getWeather(latitude, longitude)
        }

        // 2. Construct System Prompt / Context
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

        // 3. Prepare Chat History
        // Convert DB message format to Gemini format
        // User roles: 'user' -> 'user', 'bot' -> 'model'
        const chatHistory = history
            .filter(msg => msg.content && msg.content.trim() !== "")
            .map(msg => ({
                role: msg.user === "user" ? "user" : "bot",
                parts: [{ text: msg.content }],
            }));


        // Start chat with history
        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: {
                role: "system",
                parts: [{ text: systemPrompt }],
            },
        });


        // 4. Send Message
        let result;
        if (imagePath) {
            // Updated to await the async file converter
            const imagePart = await fileToGenerativePart(imagePath, "image/jpeg");
            result = await chat.sendMessage([message, imagePart]);
        } else {
            result = await chat.sendMessage(message);
        }

        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate AI response.");
    }
};