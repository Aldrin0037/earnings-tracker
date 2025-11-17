"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DailyRecord, getSettings, updateRecord } from "@/lib/storage";
import { formatCurrency, calculateBookingPay } from "@/lib/calculations";
import { z } from "zod";
import { Calendar } from "lucide-react";

const editEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  bookedAppointments: z.coerce.number()
    .int("Number of booked appointments must be a whole number")
    .min(0, "Booked appointments cannot be negative"),
  notes: z.string().optional().default(""),
});

type EditEntryFormData = z.infer<typeof editEntrySchema>;

interface EditEntryDialogProps {
  record: DailyRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void | Promise<void>;
}

export function EditEntryDialog({ 
  record, 
  open, 
  onOpenChange,
  onSave 
}: EditEntryDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [settings, setSettings] = React.useState({ basePay: 200, perBooking: 50 });
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EditEntryFormData>({
    resolver: zodResolver(editEntrySchema),
    defaultValues: {
      date: record?.date || new Date().toISOString().split('T')[0],
      bookedAppointments: record?.bookings || 0,
      notes: record?.notes || "",
    },
  });

  React.useEffect(() => {
    if (record) {
      reset({
        date: record.date,
        bookedAppointments: record.bookings,
        notes: record.notes || "",
      });
    }
    loadSettings();
  }, [record, reset]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const watchedValues = watch();
  const bookingPay = calculateBookingPay(watchedValues.bookedAppointments || 0, settings.perBooking);
  const inquiryPay = settings.basePay;
  const totalEarnings = inquiryPay + bookingPay;

  const onFormSubmit = async (data: EditEntryFormData) => {
    if (!record) return;

    setIsLoading(true);
    try {
      const updatedRecord = {
        date: data.date,
        bookings: data.bookedAppointments,
        bookingPay: bookingPay,
        inquiryPay: inquiryPay,
        totalEarnings: totalEarnings,
        notes: data.notes || "",
      };

      await updateRecord(record.id, updatedRecord);

      if (onSave) {
        await onSave();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!record || record.isInitialAdvance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <div className="relative">
              <Input
                id="edit-date"
                type="date"
                {...register("date")}
                ref={(e) => {
                  register("date").ref(e);
                  dateInputRef.current = e;
                }}
                aria-invalid={errors.date ? "true" : "false"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={handleCalendarClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Open date picker"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bookedAppointments">Booked Appointments</Label>
            <Input
              id="edit-bookedAppointments"
              type="number"
              min="0"
              {...register("bookedAppointments")}
              aria-invalid={errors.bookedAppointments ? "true" : "false"}
            />
            <p className="text-sm text-muted-foreground">
              Booking Pay: {formatCurrency(bookingPay)} ({watchedValues.bookedAppointments || 0} × {formatCurrency(settings.perBooking)})
            </p>
            {errors.bookedAppointments && (
              <p className="text-sm text-destructive">{errors.bookedAppointments.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              {...register("notes")}
              placeholder="Add any additional notes..."
              rows={3}
              aria-invalid={errors.notes ? "true" : "false"}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-lg font-semibold">
              {formatCurrency(totalEarnings)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Inquiry Pay: {formatCurrency(inquiryPay)} + Bookings: {formatCurrency(bookingPay)}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

