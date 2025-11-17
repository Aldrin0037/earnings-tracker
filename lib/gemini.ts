/**
 * Gemini AI Service (Updated for new Generative Language API)
 * Handles all AI interactions with Google's Gemini API
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DailyRecord, getSettings } from "./storage";
import { formatCurrency } from "./calculations";

// Initialize Gemini AI
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIAction {
  type: "add_record" | "delete_record" | "edit_record" | "query" | "none";
  data?: Record<string, unknown>;
  needsConfirmation?: boolean;
}

/**
 * Build context from user's earnings records
 */
export function buildRecordsContext(records: DailyRecord[]): string {
  if (records.length === 0) {
    return "No earnings records yet.";
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentRecords = sortedRecords.slice(0, 20);

  let context = `Recent Earnings Records (${records.length} total, showing last ${recentRecords.length}):\n\n`;

  recentRecords.forEach((record) => {
    const isInitial = record.isInitialAdvance;
    context += `Date: ${record.date}\n`;
    if (!isInitial) {
      context += `- Bookings: ${record.bookings}\n`;
      context += `- Booking Pay: ${formatCurrency(record.bookingPay)}\n`;
      context += `- Inquiry Pay: ${formatCurrency(record.inquiryPay)}\n`;
      context += `- Total Earnings: ${formatCurrency(record.totalEarnings)}\n`;
    }
    context += `- Remaining Balance: ${formatCurrency(record.remaining)}\n`;
    if (record.notes) {
      context += `- Notes: ${record.notes}\n`;
    }
    if (isInitial) {
      context += `- Type: Initial Advance Record\n`;
    }
    context += `- Added: ${new Date(record.createdAt).toLocaleString()}\n\n`;
  });

  const totalEarnings = records.reduce(
    (sum, r) => sum + (r.isInitialAdvance ? 0 : r.totalEarnings),
    0
  );
  const totalBookings = records.reduce((sum, r) => sum + r.bookings, 0);
  const currentBalance = records.length > 0 ? records[0].remaining : 0;

  context += `\nSummary Statistics:\n`;
  context += `- Total Earnings (all time): ${formatCurrency(totalEarnings)}\n`;
  context += `- Total Bookings (all time): ${totalBookings}\n`;
  context += `- Current Advance Balance: ${formatCurrency(currentBalance)}\n`;

  return context;
}

/**
 * Build system prompt for Gemini
 */
export async function buildSystemPrompt(records: DailyRecord[]): Promise<string> {
  const settings = await getSettings();
  const recordsContext = buildRecordsContext(records);
  const today = new Date().toISOString().split("T")[0];

  return `You are an AI assistant for a personal earnings tracking application. Your role is to help the user manage their daily earnings, bookings, and advance balance.

## Current Date
Today is: ${today}

## User's Settings
- Base Pay (Inquiry Pay): ${formatCurrency(settings.basePay)} per day
- Per Booking Rate: ${formatCurrency(settings.perBooking)} per booking
- Current Advance Balance: ${formatCurrency(settings.advanceBalance)}

## User's Earnings Records
${recordsContext}

## Your Capabilities

1. **Answer Questions**: Respond to queries about earnings, bookings, dates, balances, etc.
2. **Analyze Data**: Provide insights, trends, summaries, and predictions
3. **Perform Actions**: Help add, edit, or delete records (you'll indicate the action needed)

## Action Format

When the user wants to perform an action (add/edit/delete), respond with a JSON object wrapped in markers:

###ACTION_START###
{
  "type": "add_record" | "delete_record" | "edit_record" | "query",
  "data": {
    // Action-specific data
  },
  "confirm": true/false,
  "message": "Human-readable message explaining what you'll do"
}
###ACTION_END###

### Examples:

User: "Add 5 bookings for today"
Response:
###ACTION_START###
{
  "type": "add_record",
  "data": {
    "date": "${today}",
    "bookings": 5,
    "notes": ""
  },
  "confirm": true,
  "message": "I'll add an entry for today with 5 bookings. You'll earn ${formatCurrency(settings.basePay + (5 * settings.perBooking))}."
}
###ACTION_END###

User: "Delete yesterday's record"
Response:
###ACTION_START###
{
  "type": "delete_record",
  "data": {
    "date": "YYYY-MM-DD"
  },
  "confirm": true,
  "message": "I'll delete the record from [date]."
}
###ACTION_END###

User: "What did I earn last week?"
Response: Just answer naturally with the data (no action JSON needed).

## Guidelines

- Be friendly and conversational
- Use Philippine Peso (₱) formatting
- When unsure about dates, ask for clarification
- Always confirm destructive actions (delete)
- Provide helpful insights and summaries
- Remember all the records and their timestamps
- Use the user's actual data from the records context above

Now, respond to the user's message naturally and helpfully!`;
}

/**
 * Send a message to Gemini and get a response (NEW API)
 */
export async function sendMessageToGemini(
  userMessage: string,
  records: DailyRecord[],
  chatHistory: ChatMessage[] = []
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const systemPrompt = await buildSystemPrompt(records);

  // Format chat history for new API format
  const history = chatHistory.slice(-10).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Build contents array with system prompt and history
  const contents = [
    {
      role: "user" as const,
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model" as const,
      parts: [{ text: "I understand. I'm your earnings tracking assistant. I have access to all your records and can help you manage them, answer questions, and provide insights. How can I help you today?" }],
    },
    ...history,
    {
      role: "user" as const,
      parts: [{ text: userMessage }],
    },
  ];

  // Use generateContent with contents array
  const result = await model.generateContent({
    contents: contents,
  });

  const response = result.response;
  const text = response.text();

  return text;
}

/**
 * Parse AI response to check for actions
 */
export function parseAIAction(response: string): {
  hasAction: boolean;
  action: AIAction | null;
  message: string;
  cleanResponse: string;
} {
  const actionRegex = /###ACTION_START###([\s\S]*?)###ACTION_END###/;
  const match = response.match(actionRegex);

  if (!match) {
    return {
      hasAction: false,
      action: null,
      message: response,
      cleanResponse: response,
    };
  }

  try {
    const actionJson = match[1].trim();
    const parsedAction = JSON.parse(actionJson);

    // Remove action JSON from response
    const cleanResponse = response.replace(actionRegex, "").trim();

    return {
      hasAction: true,
      action: {
        type: parsedAction.type,
        data: parsedAction.data,
        needsConfirmation: parsedAction.confirm,
      },
      message: parsedAction.message || cleanResponse,
      cleanResponse: cleanResponse || parsedAction.message,
    };
  } catch (error) {
    console.error("Failed to parse action JSON:", error);
    return {
      hasAction: false,
      action: null,
      message: response,
      cleanResponse: response,
    };
  }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY.length > 0;
}
