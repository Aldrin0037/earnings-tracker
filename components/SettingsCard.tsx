"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EarningSettings } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { settingsFormSchema, SettingsFormData } from "@/lib/schemas";
import { Settings } from "lucide-react";

interface SettingsCardProps {
  settings: EarningSettings;
  onSave?: (settings: EarningSettings) => void | Promise<void>;
  isLoading?: boolean;
}

export function SettingsCard({ settings, onSave, isLoading = false }: SettingsCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings,
  });

  // Update form when settings prop changes
  React.useEffect(() => {
    reset(settings);
  }, [settings, reset]);

  const watchedValues = watch();

  const onFormSubmit = async (data: SettingsFormData) => {
    if (onSave) {
      await onSave(data);
      reset(data); // Reset form state after save
    }
  };

  const handleReset = () => {
    reset(settings);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Earnings Settings
        </CardTitle>
        <CardDescription>
          Configure your default earning values
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="basePay">Default Base Pay</Label>
              <div className="relative">
                <Input
                  id="basePay"
                  type="number"
                  step="0.01"
                  {...register("basePay")}
                  className="pl-12"
                  aria-invalid={errors.basePay ? "true" : "false"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₱
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your daily base pay amount
              </p>
              {errors.basePay && (
                <p className="text-sm text-destructive">{errors.basePay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perBooking">Per Booking Commission</Label>
              <div className="relative">
                <Input
                  id="perBooking"
                  type="number"
                  step="0.01"
                  {...register("perBooking")}
                  className="pl-12"
                  aria-invalid={errors.perBooking ? "true" : "false"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₱
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Commission amount per booking
              </p>
              {errors.perBooking && (
                <p className="text-sm text-destructive">{errors.perBooking.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="advanceBalance">Initial Advance Balance</Label>
              <div className="relative">
                <Input
                  id="advanceBalance"
                  type="number"
                  step="0.01"
                  {...register("advanceBalance")}
                  className="pl-12"
                  aria-invalid={errors.advanceBalance ? "true" : "false"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₱
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Starting advance balance for calculations
              </p>
              {errors.advanceBalance && (
                <p className="text-sm text-destructive">{errors.advanceBalance.message}</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Current Settings Summary</h4>
            <div className="text-sm space-y-1">
              <p>Base Pay: {formatCurrency(watchedValues.basePay || 0)}</p>
              <p>Per Booking: {formatCurrency(watchedValues.perBooking || 0)}</p>
              <p>Advance Balance: {formatCurrency(watchedValues.advanceBalance || 0)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={!isDirty || isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
              disabled={!isDirty || isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
