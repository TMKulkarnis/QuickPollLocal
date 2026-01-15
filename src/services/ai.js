import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const categorizePoll = async (question) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("Gemini API Key missing");
        return { category: "General", options: [] };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are a helper for a hyperlocal polling app. 
    Analyze the following poll question: "${question}".
    1. Assign a category (Food, Safety, Events, Transport, General).
    2. Suggest 2-3 short, likely answer options.
    
    Return pure JSON format:
    {
      "category": "String",
      "options": ["Option 1", "Option 2"]
    }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Error:", error);
        return { category: "General", options: [] };
    }
};
