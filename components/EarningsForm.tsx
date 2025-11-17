"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DailyRecord } from "@/lib/storage";
import { formatCurrency, calculateBookingPay, calculateTotalEarnings } from "@/lib/calculations";
import { earningsFormSchema, EarningsFormData } from "@/lib/schemas";
import { Calendar } from "lucide-react";

interface EarningsFormProps {
  onSubmit?: (data: Omit<DailyRecord, "id" | "createdAt">) => void | Promise<void>;
  isLoading?: boolean;
  defaultBasePay?: number;
  defaultPerBooking?: number;
}

export function EarningsForm({ 
  onSubmit, 
  isLoading = false,
  defaultBasePay = 200,
  defaultPerBooking = 50
}: EarningsFormProps) {
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EarningsFormData>({
    resolver: zodResolver(earningsFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      basePay: defaultBasePay,
      bookings: 0,
      inquiryPay: 0,
      advanceUsed: 0,
      notes: "",
      action: "",
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

  // Watch form values for real-time calculations
  const watchedValues = watch();
  const bookingPay = calculateBookingPay(watchedValues.bookings || 0, defaultPerBooking);
  const totalEarnings = calculateTotalEarnings(
    watchedValues.basePay || 0,
    bookingPay,
    watchedValues.inquiryPay || 0
  );

  const onFormSubmit = async (data: EarningsFormData) => {
    if (onSubmit) {
      const record: Omit<DailyRecord, "id" | "createdAt"> = {
        ...data,
        bookingPay,
        totalEarnings,
        remaining: 0, // Will be calculated by storage layer
      };
      
      await onSubmit(record);
      // Reset form after successful submission
      reset({
        ...data,
        bookings: 0,
        inquiryPay: 0,
        advanceUsed: 0,
        notes: "",
        action: "",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Earnings Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="basePay">Base Pay</Label>
              <Input
                id="basePay"
                type="number"
                step="0.01"
                {...register("basePay")}
                aria-invalid={errors.basePay ? "true" : "false"}
              />
              {errors.basePay && (
                <p className="text-sm text-destructive">{errors.basePay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookings">Number of Bookings</Label>
              <Input
                id="bookings"
                type="number"
                min="0"
                {...register("bookings")}
                aria-invalid={errors.bookings ? "true" : "false"}
              />
              <p className="text-sm text-muted-foreground">
                Booking Pay: {formatCurrency(bookingPay)}
              </p>
              {errors.bookings && (
                <p className="text-sm text-destructive">{errors.bookings.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiryPay">Inquiry Pay (Optional)</Label>
              <Input
                id="inquiryPay"
                type="number"
                step="0.01"
                {...register("inquiryPay")}
                aria-invalid={errors.inquiryPay ? "true" : "false"}
              />
              {errors.inquiryPay && (
                <p className="text-sm text-destructive">{errors.inquiryPay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="advanceUsed">Advance Used</Label>
              <Input
                id="advanceUsed"
                type="number"
                step="0.01"
                {...register("advanceUsed")}
                aria-invalid={errors.advanceUsed ? "true" : "false"}
              />
              {errors.advanceUsed && (
                <p className="text-sm text-destructive">{errors.advanceUsed.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action/Activity</Label>
              <Input
                id="action"
                type="text"
                {...register("action")}
                placeholder="e.g., Client meeting, Travel"
                aria-invalid={errors.action ? "true" : "false"}
              />
              {errors.action && (
                <p className="text-sm text-destructive">{errors.action.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about today's work..."
              rows={3}
              aria-invalid={errors.notes ? "true" : "false"}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-lg font-semibold">
              Total Earnings: {formatCurrency(totalEarnings)}
            </p>
            <p className="text-sm text-muted-foreground">
              Base: {formatCurrency(watchedValues.basePay || 0)} + 
              Bookings: {formatCurrency(bookingPay)} + 
              Inquiry: {formatCurrency(watchedValues.inquiryPay || 0)}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Daily Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
