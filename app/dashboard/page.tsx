"use client";

import { useState, useEffect } from "react";
import { EarningsSettingsCard } from "@/components/EarningsSettingsCard";
import { AddDailyEntryCard } from "@/components/AddDailyEntryCard";
import { HistoryTable } from "@/components/HistoryTable";
import { ExportHistoryTable } from "@/components/ExportHistoryTable";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { ExportButton } from "@/components/ExportButton";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { listRecords, deleteRecord, clearAllData, DailyRecord } from "@/lib/storage";
import { History, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSave = async () => {
    // Refresh the page or reload data
    setRefreshKey(prev => prev + 1);
    // Reload records to keep history fresh
    await loadRecords();
  };

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const loadedRecords = await listRecords();
      setRecords(loadedRecords);
    } catch (error) {
      console.error("Error loading records:", error);
      alert("Failed to load records. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load records on component mount
    loadRecords();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      await loadRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  const handleEdit = (record: DailyRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    await loadRecords();
    setEditingRecord(null);
  };

  const handleResetAllData = async () => {
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
          await loadRecords();
          setRefreshKey(prev => prev + 1);
        } catch (error) {
          console.error("Error clearing data:", error);
          alert("Failed to clear data. Please try again.");
        }
      }
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Earnings Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your daily earnings and manage your records
        </p>
      </div>

      {/* Settings and Entry Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Settings */}
        <EarningsSettingsCard
          key={`settings-${refreshKey}`}
          onSave={handleSave}
        />

        {/* Add Daily Entry */}
        <AddDailyEntryCard
          key={`entry-${refreshKey}`}
          onSubmit={handleSave}
        />
      </div>

      {/* Earnings History Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6" />
            Earnings History
          </h2>
        </div>

        {/* History Table */}
        <div id="earnings-history-table">
          <HistoryTable 
            records={records}
            onDelete={handleDelete}
            onEdit={handleEdit}
            isLoading={isLoading}
          />
        </div>

        {/* Export-ready table (hidden, used only for export) */}
        <div 
          id="earnings-history-export" 
          style={{ 
            position: 'fixed', 
            left: '-9999px', 
            top: '0',
            width: '1200px',
            backgroundColor: 'rgb(255, 255, 255)',
            zIndex: -1
          }}
        >
          <ExportHistoryTable records={records} />
        </div>

        {/* Export and Reset Buttons - Below Table */}
        <div className="flex flex-wrap gap-3 justify-center">
          <ExportButton
            targetId="earnings-history-export"
            filename={`earnings-history-${new Date().toISOString().split('T')[0]}`}
            format="png"
          />
          <ExportButton
            targetId="earnings-history-export"
            filename={`earnings-history-${new Date().toISOString().split('T')[0]}`}
            format="pdf"
          />
          <Button
            variant="destructive"
            onClick={handleResetAllData}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Reset All Data
          </Button>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AIChat
        onRecordAdded={handleSave}
        onRecordDeleted={handleSave}
      />

      {/* Edit Entry Dialog */}
      <EditEntryDialog
        record={editingRecord}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditSave}
      />
    </div>
  );
}
