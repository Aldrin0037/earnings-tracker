/**
 * Google Sheets Integration Service (Server-only)
 * Handles syncing earnings data to Google Sheets
 * This file must only be imported in server components/actions
 */

import { google } from "googleapis";
import { DailyRecord, EarningSettings } from "./storage";

// Google Sheets configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Initialize Google Sheets API client
 */
export async function getGoogleSheetsClient() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
  const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;

  if (!apiKey || !spreadsheetId) {
    throw new Error("Google Sheets API credentials not configured");
  }

  const auth = new google.auth.GoogleAuth({
    apiKey,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });

  return { sheets, spreadsheetId };
}

/**
 * Sync all records to Google Sheets
 */
export async function syncRecordsToSheets(
  records: DailyRecord[],
  settings: EarningSettings
): Promise<void> {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient();

    // Prepare data rows
    const rows = [
      // Header row
      [
        "Date",
        "Bookings",
        "Booking Pay",
        "Inquiry Pay",
        "Total Earnings",
        "Advance Used",
        "Remaining Balance",
        "Notes",
        "Action",
        "Created At",
        "Is Initial Advance",
      ],
      // Data rows
      ...records.map((record) => [
        record.date,
        record.bookings.toString(),
        record.bookingPay.toFixed(2),
        record.inquiryPay.toFixed(2),
        record.totalEarnings.toFixed(2),
        record.advanceUsed.toFixed(2),
        record.remaining.toFixed(2),
        record.notes || "",
        record.action || "",
        new Date(record.createdAt).toISOString(),
        record.isInitialAdvance ? "YES" : "NO",
      ]),
    ];

    // Add settings row at the bottom
    rows.push([]);
    rows.push(["Settings", "", "", "", "", "", "", "", "", "", ""]);
    rows.push([
      "Base Pay",
      "Per Booking",
      "Advance Balance",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    rows.push([
      settings.basePay.toFixed(2),
      settings.perBooking.toFixed(2),
      settings.advanceBalance.toFixed(2),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "Sheet1!A:Z",
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    console.log(`✅ Synced ${records.length} records to Google Sheets`);
  } catch (error) {
    console.error("Failed to sync to Google Sheets:", error);
    throw error;
  }
}

/**
 * Append a single record to Google Sheets
 */
export async function appendRecordToSheets(record: DailyRecord): Promise<void> {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient();

    const row = [
      record.date,
      record.bookings.toString(),
      record.bookingPay.toFixed(2),
      record.inquiryPay.toFixed(2),
      record.totalEarnings.toFixed(2),
      record.advanceUsed.toFixed(2),
      record.remaining.toFixed(2),
      record.notes || "",
      record.action || "",
      new Date(record.createdAt).toISOString(),
      record.isInitialAdvance ? "YES" : "NO",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:K",
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Appended record to Google Sheets: ${record.date}`);
  } catch (error) {
    console.error("Failed to append to Google Sheets:", error);
    throw error;
  }
}

