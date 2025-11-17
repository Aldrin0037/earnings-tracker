"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { format } from "date-fns";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  FileText,
  Activity
} from "lucide-react";

interface EarningsCardProps {
  record: DailyRecord | null;
  className?: string;
}

export function EarningsCard({ record, className }: EarningsCardProps) {
  if (!record) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Today's Earnings</CardTitle>
          <CardDescription>No record for today yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter your daily earnings to see the summary here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} id="earnings-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Earnings Summary</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(record.totalEarnings)}
          </span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(record.date), "MMMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Base Pay */}
          <div className="flex items-start space-x-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Base Pay</p>
              <p className="text-lg font-semibold">{formatCurrency(record.basePay)}</p>
            </div>
          </div>

          {/* Booking Pay */}
          <div className="flex items-start space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Booking Pay</p>
              <p className="text-lg font-semibold">{formatCurrency(record.bookingPay)}</p>
              <p className="text-xs text-muted-foreground">{record.bookings} bookings</p>
            </div>
          </div>

          {/* Inquiry Pay */}
          {record.inquiryPay > 0 && (
            <div className="flex items-start space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Inquiry Pay</p>
                <p className="text-lg font-semibold">{formatCurrency(record.inquiryPay)}</p>
              </div>
            </div>
          )}

          {/* Advance Used */}
          {record.advanceUsed > 0 && (
            <div className="flex items-start space-x-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Advance Used</p>
                <p className="text-lg font-semibold text-orange-600">
                  -{formatCurrency(record.advanceUsed)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Remaining Balance */}
        <div className="rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(record.remaining)}</p>
            </div>
            <div className="rounded-full bg-white p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Action/Activity */}
        {record.action && (
          <div className="flex items-start space-x-3 pt-2">
            <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Activity</p>
              <p className="text-sm text-muted-foreground">{record.action}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {record.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
