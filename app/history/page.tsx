"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryTable } from "@/components/HistoryTable";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { ExportButton } from "@/components/ExportButton";
import { Button } from "@/components/ui/button";
import { listRecords, deleteRecord, clearAllData, DailyRecord } from "@/lib/storage";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

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

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      // Reload records after deletion
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
        } catch (error) {
          console.error("Error clearing data:", error);
          alert("Failed to clear data. Please try again.");
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
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
        <h1 className="text-4xl font-bold tracking-tight">Earnings History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your earnings records
        </p>
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

      {/* Export and Reset Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <ExportButton
          targetId="earnings-history-table"
          filename={`earnings-history-${new Date().toISOString().split('T')[0]}`}
          format="png"
        />
        <ExportButton
          targetId="earnings-history-table"
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
