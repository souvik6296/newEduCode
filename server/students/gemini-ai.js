import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API configuration
// const GEMINI_API_KEY = "AIzaSyClNvwygY7QhdVUYfuKTzC5YBW2-o3Myp8";
const GEMINI_API_KEY = "AIzaSyAJvUFyBAYRwohGslYi-zlfstVmwXp1xJ0";
const MODEL_NAME = "gemini-1.5-flash";

// In-memory session store (for demo; use persistent store for production)
// Structure: { [sessionId]: { history: [...], systemPrompt: string } }
const sessionStore = {};

// Set or update the system prompt for a specific session
function setSystemPrompt(sessionId, prompt) {
    if (!sessionStore[sessionId]) return false;
    sessionStore[sessionId].systemPrompt = prompt;
    return true;
}

async function chatWithGemini(query, sessionId = null, question_details = null) {
    // Create new session if needed
    if (!sessionId || !sessionStore[sessionId]) {
        sessionId = Math.random().toString(36).slice(2) + Date.now();
        let prom = "You are a helpful AI assistant.";

        if (question_details && typeof question_details === "object") {
            const desc = question_details.description || "";
            const constraints = question_details.constraints || "";
            const inputStr = Array.isArray(question_details.input)
                ? question_details.input.map(input => input.text).join(", ")
                : "";
            const outputStr = Array.isArray(question_details.output)
                ? question_details.output.map(output => output.text).join(", ")
                : "";

            prom = `
You are an AI tutor on EduCode, a secure and ethical coding education platform.

 Your primary goal is to help the learner understand the logic, thought process, and approach behind solving coding problems — without ever writing, generating, suggesting, or referencing any code.

 You are strictly prohibited from:
- Writing full or partial code in any programming language.
- Generating function names, variable names, syntax, or templates.
- Sharing pseudocode, code structure, or algorithm templates.
- Giving hints that are code-like in nature (e.g., “use a for loop”, “define a function”).

 You are allowed and encouraged to:
- Ask guiding questions to help the user think through the problem.
- Help them understand what the problem is asking.
- Break down the constraints in simple language.
- Discuss high-level logic or real-life analogies.
- Encourage identifying patterns between input and output.
- Suggest logical steps without suggesting how to implement them in code.
- Help with identifying edge cases or boundary conditions.
- Encourage debugging thinking when the user is stuck.

 Current Problem Context:
- Problem Statement: "${desc}"
- Code Constraints: "${constraints}"
- Sample Input(s): "${inputStr}"
- Expected Output(s): "${outputStr}"

 Your tone should be:
- Encouraging and Socratic (ask questions to stimulate thinking)
- Supportive but never revealing.
- Professional and aligned with EduCode's mission to promote original thinking and secure learning.

 If the user requests code directly or indirectly:
- Politely remind them: “As part of EduCode's policy, I can't generate or share code. But I can help you think through the logic.”

 Always keep in mind:
- You are an AI logic coach, not a code generator.
- Your help should make the user better at solving problems, not dependent on shortcuts.
`;
        }

        sessionStore[sessionId] = {
            history: [],
            systemPrompt: prom
        };
    }

    // Add user message to session history
    sessionStore[sessionId].history.push({
        role: "user",
        parts: [{ text: query }]
    });

    // Sanitize message history for Gemini
    const messages = sessionStore[sessionId].history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => {
            if (typeof part === 'string') {
                return { text: part };
            } else if (typeof part === 'object' && typeof part.text === 'string') {
                return { text: part.text };
            } else {
                return { text: String(part) };
            }
        })
    }));

    // Initialize Gemini model
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    let result, responseText = "";
    try {
        const chatSession = await model.startChat({
            history: messages,
            systemInstruction: {
                role: "system",
                parts: [{ text: sessionStore[sessionId].systemPrompt }]
            }
        });

        result = await chatSession.sendMessage(query);
        responseText = result.response.text();
    } catch (err) {
        responseText = `[Gemini error: ${err && err.message ? err.message : JSON.stringify(err)}]`;
        return {
            success: false,
            response: responseText,
            sessionId,
            error: {
                message: err?.message,
                stack: err?.stack,
                raw: err
            }
        };
    }

    // Add assistant response to history
    sessionStore[sessionId].history.push({
        role: "model",
        parts: [{ text: responseText }]
    });

    return {
        success: true,
        response: responseText,
        sessionId
    };
}

export {
    chatWithGemini,
    setSystemPrompt
};
