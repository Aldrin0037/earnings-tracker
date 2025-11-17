"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsCard } from "@/components/SettingsCard";
import { InitialAdvanceCard } from "@/components/InitialAdvanceCard";
import { IntegrationSettings } from "@/components/IntegrationSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings, saveSettings, clearAllData, EarningSettings, createInitialAdvanceRecord, getInitialAdvanceRecord } from "@/lib/storage";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<EarningSettings>({
    basePay: 200,
    perBooking: 50,
    advanceBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialAdvance, setHasInitialAdvance] = useState(false);
  const [initialAdvanceAmount, setInitialAdvanceAmount] = useState<number | undefined>(undefined);
  const [isCreatingAdvance, setIsCreatingAdvance] = useState(false);

  useEffect(() => {
    loadSettings();
    checkInitialAdvance();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkInitialAdvance = async () => {
    try {
      const initialAdvance = await getInitialAdvanceRecord();
      if (initialAdvance) {
        setHasInitialAdvance(true);
        setInitialAdvanceAmount(initialAdvance.remaining);
      } else {
        setHasInitialAdvance(false);
        setInitialAdvanceAmount(undefined);
      }
    } catch (error) {
      console.error("Error checking initial advance:", error);
    }
  };

  const handleCreateInitialAdvance = async (amount: number, date: string) => {
    setIsCreatingAdvance(true);
    try {
      await createInitialAdvanceRecord(amount, date);
      await checkInitialAdvance();
      alert("Initial advance recorded successfully!");
    } catch (error: any) {
      console.error("Error creating initial advance:", error);
      alert(error.message || "Failed to create initial advance record. Please try again.");
    } finally {
      setIsCreatingAdvance(false);
    }
  };

  const handleSaveSettings = async (newSettings: EarningSettings) => {
    setIsSaving(true);
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will delete ALL your data including settings and records. This action cannot be undone. Are you sure?"
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        "Are you absolutely sure? All your earnings records will be permanently deleted."
      );
      
      if (doubleConfirmed) {
        try {
          await clearAllData();
          alert("All data has been cleared.");
          router.push("/dashboard");
        } catch (error) {
          console.error("Error clearing data:", error);
          alert("Failed to clear data. Please try again.");
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your earnings tracker preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Initial Advance Card */}
        <InitialAdvanceCard
          hasInitialAdvance={hasInitialAdvance}
          currentAdvanceAmount={initialAdvanceAmount}
          onCreate={handleCreateInitialAdvance}
          isLoading={isCreatingAdvance}
        />

        {/* Settings Card */}
        <SettingsCard
          settings={settings}
          onSave={handleSaveSettings}
          isLoading={isSaving}
        />

        {/* Cloud Integrations */}
        <IntegrationSettings />

        {/* Data Management */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Actions that permanently affect your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Clear All Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all your earnings records and reset settings to defaults.
                  This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleClearData}
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Mode Info */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Currently using: <span className="font-medium">Local Storage</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your data is stored locally in this browser and will persist between sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
