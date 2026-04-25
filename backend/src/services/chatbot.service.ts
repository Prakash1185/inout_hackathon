import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env";

export interface ChatbotMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatbotResponse {
  reply: string;
  source: "gemini" | "fallback";
}

const SYSTEM_PROMPT = [
  "You are Velora AI, a friendly and knowledgeable fitness, nutrition, and recovery assistant.",
  "You help users with:",
  "- Exercise form and technique advice",
  "- Nutrition and meal planning guidance",
  "- Injury recovery and rehabilitation tips",
  "- General wellness and fitness motivation",
  "- Understanding their workout plans and progress",
  "",
  "Rules:",
  "- Keep responses concise and actionable (2-4 paragraphs max)",
  "- Be encouraging but honest",
  "- Always recommend consulting a doctor for medical concerns",
  "- Use simple language, avoid overly technical jargon",
  "- If asked about something outside fitness/health, politely redirect",
  "- Format with bullet points when listing tips or steps",
].join("\n");

function getFallbackModelList(): string[] {
  const raw = env.GEMINI_FALLBACK_MODELS ?? "";
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
}

export async function chatWithVelora(
  history: ChatbotMessage[],
  userMessage: string,
): Promise<ChatbotResponse> {
  if (!env.GEMINI_API_KEY) {
    return {
      reply:
        "I'm having trouble connecting right now. Please try again in a moment.",
      source: "fallback",
    };
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const contents = [
    { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: "model" as const,
      parts: [
        {
          text: "I understand. I'm Velora AI, your fitness, nutrition, and recovery assistant. How can I help you today?",
        },
      ],
    },
    ...history.map((msg) => ({
      role: msg.role === "model" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    })),
    { role: "user" as const, parts: [{ text: userMessage }] },
  ];

  const models = [
    env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    ...getFallbackModelList(),
  ];
  const uniqueModels = [...new Set(models)];

  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          temperature: 0.6,
          maxOutputTokens: 1024,
        },
      });

      const text = (response.text ?? "").trim();
      if (text) {
        return { reply: text, source: "gemini" };
      }
    } catch (error) {
      console.warn(`[Chatbot] Model ${model} failed:`, error);
    }
  }

  return {
    reply:
      "I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore the Recovery AI, Food IQ, or AI Trainer features directly from the app.",
    source: "fallback",
  };
}
