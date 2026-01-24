import { GoogleGenAI } from "@google/genai";

// Fixed: Use process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant for a Qatar-based car insurance and city services app called 'Doha Services'. Keep answers concise, friendly, and helpful. Currencies are in QAR.",
      }
    });
    return response.text || "I'm sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the network right now.";
  }
};