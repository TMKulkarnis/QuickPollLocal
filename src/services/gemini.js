import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const analyzePoll = async (poll, comments) => {
    if (!API_KEY) {
        throw new Error("API Key not found. Please checks your .env file.");
    }
    if (!genAI) {
        throw new Error("Gemini client not initialized.");
    }

    // Use gemini-1.5-flash for faster, cheaper inference
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    if (poll.type === 'question') {
        if (!comments || comments.length === 0) {
            return "No comments to analyze yet. Be the first to start the discussion!";
        }
        const commentsText = comments.map(c => `- ${c.authorName}: ${c.text}`).join("\n");
        prompt = `
Analyze this community question and its discussion.
Question: "${poll.question}"
Category: ${poll.category}

Comments:
${commentsText}

Task:
1. Summarize the consensus or top recommendations.
2. Highlight any unique tips.
3. Keep it helpful and concise (max 3 sentences).
`;
    } else {
        const totalVotes = poll.options.reduce((acc, curr) => acc + (curr.count || 0), 0);
        const optionsText = poll.options.map(o => `- ${o.text}: ${o.count} votes`).join("\n");

        let commentsContext = "No comments yet.";
        if (comments && comments.length > 0) {
            commentsContext = comments.slice(0, 10).map(c => `- ${c.authorName}: ${c.text}`).join("\n");
        }

        prompt = `
Analyze this community poll results.
Question: "${poll.question}"
Total Votes: ${totalVotes}

Results:
${optionsText}

Discussion Context:
${commentsContext}

Task:
1. Summarize the winning option.
2. Explain potential reasons based on the context (or common sense if no comments).
3. Keep it short (max 2 sentences).
`;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
};
