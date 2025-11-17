"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DailyRecord, getSettings, saveRecord } from "@/lib/storage";
import { formatCurrency, calculateBookingPay } from "@/lib/calculations";
import { z } from "zod";
import { Plus, Calendar } from "lucide-react";

const dailyEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  bookedAppointments: z.coerce.number()
    .int("Number of booked appointments must be a whole number")
    .min(0, "Booked appointments cannot be negative"),
  notes: z.string().optional().default(""),
});

type DailyEntryFormData = z.infer<typeof dailyEntrySchema>;

interface AddDailyEntryCardProps {
  onSubmit?: () => void | Promise<void>;
}

export function AddDailyEntryCard({ onSubmit }: AddDailyEntryCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [settings, setSettings] = React.useState({ basePay: 200, perBooking: 50 });
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<DailyEntryFormData>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      bookedAppointments: 0,
      notes: "",
    },
  });

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      // Try modern showPicker API first, fallback to click
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const watchedValues = watch();
  const bookingPay = calculateBookingPay(watchedValues.bookedAppointments || 0, settings.perBooking);
  const inquiryPay = settings.basePay; // Fixed daily inquiry pay (always 1 inquiry × basePay)
  // Total earnings = Inquiry Pay + Booking Pay (basePay is already included in inquiryPay)
  const totalEarnings = inquiryPay + bookingPay;

  const onFormSubmit = async (data: DailyEntryFormData) => {
    setIsLoading(true);
    try {
      const record: Omit<DailyRecord, "id" | "createdAt"> = {
        date: data.date,
        basePay: settings.basePay, // Fixed daily inquiry pay
        bookings: data.bookedAppointments,
        bookingPay: bookingPay,
        inquiryPay: inquiryPay, // Fixed daily inquiry pay (1 × basePay)
        totalEarnings: totalEarnings,
        advanceUsed: 0, // No advance used in the simple flow
        remaining: 0, // Will be calculated by storage layer
        notes: data.notes || "",
        action: "", // No action field in simplified form
      };
      
      await saveRecord(record);

      // Reset form after successful submission
      reset({
        date: new Date().toISOString().split('T')[0],
        bookedAppointments: 0,
        notes: "",
      });

      if (onSubmit) {
        await onSubmit();
      }

      // Entry added successfully (silent - no popup notification)
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Daily Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
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
            <Label htmlFor="bookedAppointments">Booked Appointments</Label>
            <Input
              id="bookedAppointments"
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any additional notes..."
              rows={3}
              aria-invalid={errors.notes ? "true" : "false"}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

