import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const analyzePoll = async (poll, comments) => {
    if (!genAI) {
        throw new Error("Gemini API Key is missing");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = "";

    if (poll.type === 'question') {
        const commentsText = comments.map(c => `- ${c.authorName}: ${c.text}`).join("\n");
        prompt = `
Analyze this community question and its discussion.
Question: "${poll.question}"
Category: ${poll.category}
Location Context: Poll is located near coordinates (if relevant to question).

Comments:
${commentsText}

Task:
1. Summarize the consensus or top recommendations from the community.
2. Highlight any dissenting opinions or unique tips.
3. Keep the tone helpful, community-focused, and concise (max 3-4 sentences).
4. Format using Markdown (bold key terms).
`;
    } else {
        const totalVotes = poll.options.reduce((acc, curr) => acc + (curr.count || 0), 0);
        const optionsText = poll.options.map(o => `- ${o.text}: ${o.count} votes`).join("\n");
        const commentsText = comments.slice(0, 10).map(c => `- ${c.authorName}: ${c.text}`).join("\n"); // Limit comments for context

        prompt = `
Analyze this community poll results.
Question: "${poll.question}"
Total Votes: ${totalVotes}

Results:
${optionsText}

Discussion Context (sample comments):
${commentsText}

Task:
1. Summarize the winning option and the margin.
2. Explain WHY users might be preferring this (infer from context/comments).
3. Keep it short and insightful (max 3 sentences).
`;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error("Failed to analyze poll. AI is overloaded or unavailable.");
    }
};
