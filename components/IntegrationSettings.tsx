"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Webhook, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import {
  isGoogleSheetsConfigured,
  isN8NConfigured,
  syncRecordsToSheets,
  sendWebhookToN8N,
} from "@/lib/googleSheets";

export function IntegrationSettings() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState<string | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<"success" | "error" | null>(null);

  const googleSheetsEnabled = isGoogleSheetsConfigured();
  const n8nEnabled = isN8NConfigured();

  const handleSyncToSheets = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      await syncRecordsToSheets();

      // Send webhook notification
      await sendWebhookToN8N("sync_complete", {
        timestamp: new Date().toISOString(),
      });

      setLastSync(new Date().toISOString());
      setSyncStatus("success");
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      await sendWebhookToN8N("sync_complete", {
        test: true,
        timestamp: new Date().toISOString(),
      });
      alert("Test webhook sent successfully!");
    } catch (error) {
      alert("Failed to send test webhook");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Cloud Integrations
        </CardTitle>
        <CardDescription>
          Connect your earnings tracker to Google Sheets and n8n for advanced automation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Sheets Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Google Sheets</h3>
              {googleSheetsEnabled ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {googleSheetsEnabled
                ? "Sync your data to Google Sheets for backup and analysis"
                : "Add GOOGLE_SHEETS_API_KEY and GOOGLE_SPREADSHEET_ID to .env.local"}
            </p>
            {lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(lastSync).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleSyncToSheets}
            disabled={!googleSheetsEnabled || isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>

        {/* Sync Status Message */}
        {syncStatus === "success" && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Successfully synced to Google Sheets!
            </p>
          </div>
        )}
        {syncStatus === "error" && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ Failed to sync. Check console for details.
            </p>
          </div>
        )}

        {/* n8n Webhook Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">n8n Automation</h3>
              {n8nEnabled ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {n8nEnabled
                ? "Automated workflows and AI agents are active"
                : "Add N8N_WEBHOOK_URL to .env.local to enable automation"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleTestWebhook}
            disabled={!n8nEnabled}
            className="gap-2"
          >
            <Webhook className="h-4 w-4" />
            Test Webhook
          </Button>
        </div>

        {/* Setup Instructions */}
        {(!googleSheetsEnabled || !n8nEnabled) && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Setup Instructions</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              {!googleSheetsEnabled && (
                <>
                  <li>Create a Google Sheets spreadsheet</li>
                  <li>Enable Google Sheets API in Google Cloud Console</li>
                  <li>Add API key and spreadsheet ID to .env.local</li>
                </>
              )}
              {!n8nEnabled && (
                <>
                  <li>Set up n8n workflow (see N8N_SETUP.md)</li>
                  <li>Create a webhook trigger in n8n</li>
                  <li>Add webhook URL to .env.local</li>
                </>
              )}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
