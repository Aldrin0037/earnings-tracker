/**
 * Google Sheets Integration Service (Client-safe)
 * Client-safe functions that don't use Node.js modules
 * Server-only functions are in googleSheets.server.ts
 */

/**
 * Send webhook notification to n8n
 */
export async function sendWebhookToN8N(
  eventType: "record_added" | "record_updated" | "record_deleted" | "sync_complete",
  data: any
): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("n8n webhook URL not configured");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }

    console.log(`✅ Sent webhook to n8n: ${eventType}`);
  } catch (error) {
    console.error("Failed to send webhook to n8n:", error);
    // Don't throw - webhook failures shouldn't break the app
  }
}

/**
 * Check if Google Sheets is configured
 */
export function isGoogleSheetsConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID
  );
}

/**
 * Check if n8n webhook is configured
 */
export function isN8NConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
}

/**
 * Sync records to Google Sheets (client wrapper for API route)
 */
export async function syncRecordsToSheets(): Promise<void> {
  const response = await fetch("/api/google-sheets/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sync to Google Sheets");
  }

  const result = await response.json();
  console.log(result.message);
}
