import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

// Low temperature for deterministic JSON extraction
export function getExtractionModel() {
  return getClient().getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });
}

// Slightly higher temperature for nuanced risk analysis prose
export function getAnalysisModel() {
  return getClient().getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });
}
