import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (e) {
        console.error("Failed to initialize Gemini:", e);
    }
}

export const askGemini = async (prompt: string): Promise<string> => {
    if (!API_KEY || !model) {
        console.warn("Gemini API Key is missing or initialization failed");
        return "I'm sorry, I can't answer that right now because my brain is missing an API key.";
    }
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini:", error);
        return "Sorry, I encountered an error while thinking.";
    }
};
