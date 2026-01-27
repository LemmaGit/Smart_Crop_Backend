import fetch from "node-fetch"; // if running in Node.js
import dotenv from "dotenv";

dotenv.config();

class YouTubeService {
  static async fetchVideos(query) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}`,
      );

      const data = await response.json();
      const items = data.items || [];

      return items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
      }));
    } catch (e) {
      console.error("YouTube fetch error:", e);
      return [];
    }
  }
}

export default new YouTubeService();
