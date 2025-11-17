"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EarningSettings, getSettings, saveSettings, createInitialAdvanceRecord, getInitialAdvanceRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { z } from "zod";
import { Settings, Calendar } from "lucide-react";

const earningsSettingsSchema = z.object({
  initialAdvanceAmount: z.coerce.number()
    .min(0, "Initial advance amount must be a positive number")
    .multipleOf(0.01, "Initial advance amount must have at most 2 decimal places"),
  initialAdvanceDate: z.string().min(1, "Initial advance date is required"),
  fixedDailyInquiryPay: z.coerce.number()
    .min(0, "Fixed daily inquiry pay must be a positive number")
    .multipleOf(0.01, "Fixed daily inquiry pay must have at most 2 decimal places"),
  perAppointmentRate: z.coerce.number()
    .min(0, "Per-appointment rate must be a positive number")
    .multipleOf(0.01, "Per-appointment rate must have at most 2 decimal places"),
});

type EarningsSettingsFormData = z.infer<typeof earningsSettingsSchema>;

interface EarningsSettingsCardProps {
  onSave?: () => void | Promise<void>;
}

export function EarningsSettingsCard({ onSave }: EarningsSettingsCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasInitialAdvance, setHasInitialAdvance] = React.useState(false);
  const [currentAdvanceAmount, setCurrentAdvanceAmount] = React.useState<number>(0);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<EarningsSettingsFormData>({
    resolver: zodResolver(earningsSettingsSchema),
    defaultValues: {
      initialAdvanceAmount: 0,
      initialAdvanceDate: new Date().toISOString().split('T')[0],
      fixedDailyInquiryPay: 200,
      perAppointmentRate: 50,
    },
  });

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      const initialAdvance = await getInitialAdvanceRecord();
      
      if (initialAdvance) {
        setHasInitialAdvance(true);
        setCurrentAdvanceAmount(initialAdvance.remaining);
        reset({
          initialAdvanceAmount: initialAdvance.remaining,
          initialAdvanceDate: initialAdvance.date,
          fixedDailyInquiryPay: settings.basePay,
          perAppointmentRate: settings.perBooking,
        });
      } else {
        setHasInitialAdvance(false);
        reset({
          initialAdvanceAmount: 0,
          initialAdvanceDate: new Date().toISOString().split('T')[0],
          fixedDailyInquiryPay: settings.basePay,
          perAppointmentRate: settings.perBooking,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const onFormSubmit = async (data: EarningsSettingsFormData) => {
    setIsLoading(true);
    try {
      // Save settings
      const settings: EarningSettings = {
        basePay: data.fixedDailyInquiryPay,
        perBooking: data.perAppointmentRate,
        advanceBalance: data.initialAdvanceAmount,
      };
      await saveSettings(settings);

      // Create or update initial advance record
      if (!hasInitialAdvance && data.initialAdvanceAmount > 0) {
        try {
          await createInitialAdvanceRecord(data.initialAdvanceAmount, data.initialAdvanceDate);
        } catch (error: any) {
          // If initial advance already exists, that's okay - settings are saved
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }

      await loadSettings();
      
      if (onSave) {
        await onSave();
      }
      
      alert("Settings saved successfully!");
      reset(data); // Reset form state after save
    } catch (error: any) {
      console.error("Error saving settings:", error);
      alert(error.message || "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const watchedValues = watch();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Earnings Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initialAdvanceAmount">Initial Advance Amount (₱)</Label>
            <div className="relative">
              <Input
                id="initialAdvanceAmount"
                type="number"
                step="0.01"
                {...register("initialAdvanceAmount")}
                className="pl-12"
                aria-invalid={errors.initialAdvanceAmount ? "true" : "false"}
                disabled={hasInitialAdvance}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₱
              </span>
            </div>
            {hasInitialAdvance && (
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(currentAdvanceAmount)}. Delete the initial advance record in History to change this.
              </p>
            )}
            {errors.initialAdvanceAmount && (
              <p className="text-sm text-destructive">{errors.initialAdvanceAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialAdvanceDate">Initial Advance Date</Label>
            <div className="relative">
              <Input
                id="initialAdvanceDate"
                type="date"
                {...register("initialAdvanceDate")}
                ref={(e) => {
                  register("initialAdvanceDate").ref(e);
                  dateInputRef.current = e;
                }}
                aria-invalid={errors.initialAdvanceDate ? "true" : "false"}
                disabled={hasInitialAdvance}
                className="pr-10"
              />
              <button
                type="button"
                onClick={handleCalendarClick}
                disabled={hasInitialAdvance}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Open date picker"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            {errors.initialAdvanceDate && (
              <p className="text-sm text-destructive">{errors.initialAdvanceDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixedDailyInquiryPay">Fixed Daily Inquiry Pay (₱)</Label>
            <div className="relative">
              <Input
                id="fixedDailyInquiryPay"
                type="number"
                step="0.01"
                {...register("fixedDailyInquiryPay")}
                className="pl-12"
                aria-invalid={errors.fixedDailyInquiryPay ? "true" : "false"}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₱
              </span>
            </div>
            {errors.fixedDailyInquiryPay && (
              <p className="text-sm text-destructive">{errors.fixedDailyInquiryPay.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="perAppointmentRate">Per-Appointment Rate (₱)</Label>
            <div className="relative">
              <Input
                id="perAppointmentRate"
                type="number"
                step="0.01"
                {...register("perAppointmentRate")}
                className="pl-12"
                aria-invalid={errors.perAppointmentRate ? "true" : "false"}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₱
              </span>
            </div>
            {errors.perAppointmentRate && (
              <p className="text-sm text-destructive">{errors.perAppointmentRate.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isDirty || isLoading}
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

