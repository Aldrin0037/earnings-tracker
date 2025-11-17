import { NextRequest, NextResponse } from "next/server";
import { syncRecordsToSheets } from "@/lib/googleSheets.server";
import { listRecords, getSettings } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const records = await listRecords();
    const settings = await getSettings();
    await syncRecordsToSheets(records, settings);
    
    return NextResponse.json({ 
      success: true, 
      message: `Synced ${records.length} records to Google Sheets` 
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync" },
      { status: 500 }
    );
  }
}

