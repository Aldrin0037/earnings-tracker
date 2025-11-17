"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import { z } from "zod";
import { Wallet, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

const initialAdvanceSchema = z.object({
  advanceAmount: z.coerce.number()
    .min(0, "Advance amount must be a positive number")
    .multipleOf(0.01, "Advance amount must have at most 2 decimal places"),
  date: z.string().min(1, "Date is required"),
});

type InitialAdvanceFormData = z.infer<typeof initialAdvanceSchema>;

interface InitialAdvanceCardProps {
  hasInitialAdvance: boolean;
  currentAdvanceAmount?: number;
  onCreate?: (amount: number, date: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function InitialAdvanceCard({ 
  hasInitialAdvance, 
  currentAdvanceAmount,
  onCreate, 
  isLoading = false 
}: InitialAdvanceCardProps) {
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<InitialAdvanceFormData>({
    resolver: zodResolver(initialAdvanceSchema),
    defaultValues: {
      advanceAmount: currentAdvanceAmount || 0,
      date: new Date().toISOString().split('T')[0],
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

  const watchedAmount = watch("advanceAmount");

  const onFormSubmit = async (data: InitialAdvanceFormData) => {
    if (onCreate) {
      await onCreate(data.advanceAmount, data.date);
      reset(data); // Reset form state after save
    }
  };

  return (
    <Card className={`w-full ${hasInitialAdvance ? 'border-green-500/50' : 'border-orange-500/50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Initial Advance Amount
        </CardTitle>
        <CardDescription>
          {hasInitialAdvance 
            ? "Your initial advance has been recorded. This is the starting balance for all calculations."
            : "Record your initial advance amount. This will be the starting balance for all earnings calculations."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasInitialAdvance ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Initial Advance Recorded</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Initial advance amount: <span className="font-bold text-lg">{formatCurrency(currentAdvanceAmount || 0)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                This record appears in your earnings history. You can view it in the History tab.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Note</span>
              </div>
              <p className="text-xs text-muted-foreground">
                To change the initial advance amount, you'll need to delete the existing initial advance record from the History page first.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="advanceAmount">Advance Amount</Label>
              <div className="relative">
                <Input
                  id="advanceAmount"
                  type="number"
                  step="0.01"
                  {...register("advanceAmount")}
                  className="pl-12"
                  aria-invalid={errors.advanceAmount ? "true" : "false"}
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₱
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the total advance amount you received
              </p>
              {errors.advanceAmount && (
                <p className="text-sm text-destructive">{errors.advanceAmount.message}</p>
              )}
            </div>

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
              <p className="text-sm text-muted-foreground">
                Date when you received the advance
              </p>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Preview */}
            {watchedAmount > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="font-medium text-sm">Preview</h4>
                <div className="text-sm space-y-1">
                  <p>Initial Advance: <span className="font-bold">{formatCurrency(watchedAmount)}</span></p>
                  <p className="text-muted-foreground">
                    This will create a record in your earnings history showing the initial balance.
                  </p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={!isDirty || isLoading || watchedAmount <= 0}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Record Initial Advance"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

