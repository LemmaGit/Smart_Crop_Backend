import fetch from "node-fetch"; // If Node.js
import dotenv from "dotenv";

dotenv.config();

class ArticleService {
  constructor() {
    this.apiKey = process.env.MY_GOOGLE_CUSTOM_SEARCH_API_KEY;
    this.searchEngineId = process.env.MY_CUSTOM_SEARCH_ENGINE_ID;
  }

  async fetchArticles(query, maxResults = 6) {
    try {
      const searchQuery = `${query} agriculture farming treatment prevention`;

      const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(
        searchQuery,
      )}&num=${maxResults}&sort=date`;

      const response = await fetch(url);
      if (!response.ok) {
        return this._getFallbackArticles(query);
      }

      const data = await response.json();
      const items = data.items || [];

      if (!items.length) return this._getFallbackArticles(query);

      return items.map((item) => ({
        title: item.title || "No Title",
        link: item.link || "",
        snippet: item.snippet || "No description available",
        source: this._extractSource(item.displayLink || ""),
      }));
    } catch (e) {
      console.error("Article fetch error:", e);
      return this._getFallbackArticles(query);
    }
  }

  _extractSource(displayLink) {
    if (displayLink.includes("agriculture.com")) return "Agriculture.com";
    if (displayLink.includes("fao.org")) return "FAO";
    if (displayLink.includes("extension.org")) return "Extension.org";
    if (displayLink.includes(".sciencedirect.")) return "ScienceDirect";
    if (displayLink.includes(".gov")) return "Government Resource";

    // Remove www and domain extensions for cleaner display
    return displayLink
      .replace("www.", "")
      .replace(".com", "")
      .replace(".org", "")
      .replace(".edu", "")
      .split(".")[0]
      .toUpperCase();
  }

  _getFallbackArticles(query) {
    return [
      {
        title: `Comprehensive Guide for ${query} Management`,
        link: "https://example.com/article1",
        snippet: `Learn about identification, prevention, and treatment methods for ${query} in agricultural settings.`,
        source: "AGRICULTURE_GUIDE",
      },
      {
        title: `Organic Treatment Options for ${query}`,
        link: "https://example.com/article2",
        snippet: `Explore natural and organic methods to control and prevent ${query} in your crops.`,
        source: "ORGANIC_FARMING",
      },
      {
        title: `${query}: Symptoms and Solutions`,
        link: "https://example.com/article3",
        snippet: `Detailed analysis of ${query} symptoms, lifecycle, and effective control measures.`,
        source: "CROP_PROTECTION",
      },
    ];
  }
}

export default new ArticleService();
