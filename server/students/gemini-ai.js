// gemini-ai.js
// Service-account OAuth for Gemini, correct scope, and user-project header

// const { GoogleAuth } = require('google-auth-library');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

import { GoogleAuth } from 'google-auth-library';
import { GoogleGenerativeAI } from '@google/generative-ai';


// ===== Configuration =====
// Path to your downloaded key file (from your new project)
const KEY_FILE = process.env.GEMINI_KEY_FILE || 'gemini-key.json';

// The GCP project to charge/quota-route requests to
const PROJECT_ID = process.env.GEMINI_PROJECT_ID || 'starlit-verve-472920-v5';

// Model name; align with your curl test
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// OAuth scope: IMPORTANT — must be generative-language
const SCOPES = ['https://www.googleapis.com/auth/generative-language'];

// ===== Session store (unchanged) =====
const sessionStore = {};

function setSystemPrompt(sessionId, prompt) {
  if (!sessionStore[sessionId]) {
    sessionStore[sessionId] = { history: [], systemPrompt: '' };
  }
  sessionStore[sessionId].systemPrompt = prompt;
  return true;
}

// Build an authorized fetch that injects OAuth token and user-project header
async function makeAuthedFetch() {
  console.log('[gemini] makeAuthedFetch: start');
  // Capture the original fetch to avoid recursion when we override global.fetch
  const baseFetch = (typeof global.fetch === 'function') ? global.fetch.bind(global) : undefined;
  if (!baseFetch) {
    throw new Error('Global fetch is not available. Use Node 18+ or provide a fetch polyfill.');
  }

  const auth = new GoogleAuth({
    keyFile: KEY_FILE,
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  console.log('[gemini] makeAuthedFetch: got client');

  const authedFetch = async (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    const token = await client.getAccessToken();
    headers.set('Authorization', `Bearer ${token.token || token}`);
    headers.set('x-goog-user-project', PROJECT_ID);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort('fetch timeout (25s)'), 25000);

    try {
      return await baseFetch(url, { ...options, headers, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  return authedFetch;
}

async function chatWithGemini(query, sessionId = null, question_details = null) {
  console.log('[gemini] chatWithGemini: start');
  // Create new session if needed
  if (!sessionId || !sessionStore[sessionId]) {
    sessionId = Math.random().toString(36).slice(2) + Date.now();
    let prom = 'You are a helpful AI assistant.';
    if (question_details && typeof question_details === 'object') {
      const desc = question_details.description || '';
      const constraints = question_details.constraints || '';
      const inputStr = Array.isArray(question_details.input)
        ? question_details.input.map(input => input.text).join(', ')
        : '';
      const outputStr = Array.isArray(question_details.output)
        ? question_details.output.map(output => output.text).join(', ')
        : '';

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
      systemPrompt: prom,
    };
  }

  // Add user message to session history
  sessionStore[sessionId].history.push({
    role: 'user',
    parts: [{ text: query }],
  });

  // Sanitize message history
  const messages = sessionStore[sessionId].history.map(msg => ({
    role: msg.role,
    parts: msg.parts.map(part => {
      if (typeof part === 'string') return { text: part };
      if (typeof part === 'object' && typeof part.text === 'string') return { text: part.text };
      return { text: String(part) };
    }),
  }));

  let responseText = '';
  try {
    // Build an authed fetch and create client with it
    const authedFetch = await makeAuthedFetch();

    // @google/generative-ai supports custom fetch via global
    const genAI = new GoogleGenerativeAI({
      apiKey: undefined, // not used in SA flow
      // The SDK reads global fetch; ensure Node 18+ or bring a ponyfill
    });

    // Monkey-patch global fetch for this call scope if needed
    // If your runtime already has global fetch (Node 18+), the wrapper will apply headers on direct REST.
    global.fetch = authedFetch;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Guard startChat with a timeout so we can surface issues instead of hanging
    const startChatTimeoutMs = 15000;
    const chatSession = await Promise.race([
      model.startChat({
        history: messages,
        systemInstruction: {
          role: 'system',
          parts: [{ text: sessionStore[sessionId].systemPrompt }],
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('startChat timeout')), startChatTimeoutMs)),
    ]);

    // Guard sendMessage with a timeout as well
    const sendMsgTimeoutMs = 30000;
    const result = await Promise.race([
      chatSession.sendMessage(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error('sendMessage timeout')), sendMsgTimeoutMs)),
    ]);
    responseText = result.response.text();
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return {
      success: false,
      response: `[Gemini error: ${message}]`,
      sessionId,
      error: {
        message,
        stack: err && err.stack ? err.stack : undefined,
        raw: err,
      },
    };
  }

  // Add assistant response to history
  sessionStore[sessionId].history.push({
    role: 'model',
    parts: [{ text: responseText }],
  });

  return {
    success: true,
    response: responseText,
    sessionId,
  };
}

export{
  chatWithGemini,
  setSystemPrompt,
};