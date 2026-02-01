import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Warning if key is missing (for developers)
if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function sendMessageToGemini(message: string): Promise<string> {
  if (!apiKey) {
    return "Error: API Key is missing. Please configure VITE_GEMINI_API_KEY.";
  }

  try {
    // Use the flash model for speed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "I'm having trouble connecting to my AI brain right now. Please try again later.";
  }
}
