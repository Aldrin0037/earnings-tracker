/**
 * n8n Webhook API Route
 * Handles incoming webhooks from n8n workflows
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listRecords,
  saveRecord,
  deleteRecord,
  getSettings,
  DailyRecord,
} from "@/lib/storage";
import { sendMessageToGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "get_records":
        // Return all records
        const records = await listRecords();
        return NextResponse.json({
          success: true,
          records,
        });

      case "get_settings":
        // Return settings
        const settings = await getSettings();
        return NextResponse.json({
          success: true,
          settings,
        });

      case "add_record":
        // Add a new record from n8n
        if (!data) {
          return NextResponse.json(
            { success: false, error: "Missing record data" },
            { status: 400 }
          );
        }
        await saveRecord(data as Omit<DailyRecord, "id" | "createdAt">);
        return NextResponse.json({
          success: true,
          message: "Record added successfully",
        });

      case "ai_query":
        // Process AI query through Gemini
        if (!data?.query) {
          return NextResponse.json(
            { success: false, error: "Missing query" },
            { status: 400 }
          );
        }
        const allRecords = await listRecords();
        const aiResponse = await sendMessageToGemini(
          data.query,
          allRecords,
          data.chatHistory || []
        );
        return NextResponse.json({
          success: true,
          response: aiResponse,
        });

      case "sync_status":
        // Return sync status
        return NextResponse.json({
          success: true,
          status: "ready",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("n8n webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: "ok",
    service: "n8n webhook endpoint",
    timestamp: new Date().toISOString(),
  });
}
