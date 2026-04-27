import { GoogleGenAI } from "@google/genai";

const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const GEMINI_API_KEY = "";

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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function tryModelChat(
  ai: InstanceType<typeof GoogleGenAI>,
  model: string,
  messages: ChatMessage[],
  userMessage: string,
): Promise<string | null> {
  try {
    const historyParts = messages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    }));

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
      ...historyParts,
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    });

    const text = (response.text ?? "").trim();
    return text || null;
  } catch (error) {
    console.warn(`[Chatbot] Model ${model} failed:`, error);
    return null;
  }
}

export async function sendChatMessage(
  history: ChatMessage[],
  userMessage: string,
): Promise<ChatMessage> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Try each model in the fallback chain
  for (const model of GEMINI_MODELS) {
    const response = await tryModelChat(ai, model, history, userMessage);
    if (response) {
      return {
        id: createMessageId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
    }
  }

  // All models failed — return a graceful fallback
  return {
    id: createMessageId(),
    role: "assistant",
    content:
      "I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore the Recovery AI, Food IQ, or AI Trainer features directly from the app.",
    timestamp: Date.now(),
  };
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: createMessageId(),
    role: "user",
    content: content.trim(),
    timestamp: Date.now(),
  };
}
