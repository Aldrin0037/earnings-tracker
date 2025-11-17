"use client";

import * as React from "react";
import { DailyRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

interface ExportHistoryTableProps {
  records: DailyRecord[];
}

export function ExportHistoryTable({ records }: ExportHistoryTableProps) {
  // Sort records by date (newest first, matching dashboard display)
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Newest first (same as dashboard)
  });

  return (
    <div className="p-6 bg-background min-w-full">
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>
            Showing {sortedRecords.length} of {records.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Daily<br/>Earnings</th>
                  <th className="text-left py-3 px-4 font-semibold">Inquiry Pay (from<br/>Appointments)</th>
                  <th className="text-left py-3 px-4 font-semibold">Booked<br/>Appointments</th>
                  <th className="text-left py-3 px-4 font-semibold">Total<br/>Earnings</th>
                  <th className="text-left py-3 px-4 font-semibold">Remaining<br/>Advance<br/>Balance</th>
                  <th className="text-left py-3 px-4 font-semibold">Notes</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records found
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record) => {
                    const isInitialAdvance = record.isInitialAdvance;
                    const perBookingRate = record.bookingPay > 0 && record.bookings > 0 
                      ? record.bookingPay / record.bookings 
                      : 50;
                    const inquiryRate = record.basePay;
                    const inquiries = record.inquiryPay > 0 ? 1 : 0;

                    return (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {format(new Date(record.date), "yyyy-MM-dd")}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-blue-600">
                            {isInitialAdvance ? formatCurrency(0) : formatCurrency(record.totalEarnings)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {isInitialAdvance ? (
                            <span className="text-purple-600 font-semibold">Initial Advance Amount</span>
                          ) : inquiries > 0 ? (
                            <div className="text-sm">
                              <span>{inquiries} × {formatCurrency(inquiryRate)} = </span>
                              <span className="text-purple-600 font-semibold">{formatCurrency(record.inquiryPay || record.basePay)}</span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {!isInitialAdvance && record.bookings > 0 ? (
                            <div className="text-sm">
                              <div>{record.bookings} × {formatCurrency(perBookingRate)} =</div>
                              <div className="text-purple-600 font-semibold">{formatCurrency(record.bookingPay)}</div>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {!isInitialAdvance ? (
                            <span className="font-bold text-green-600">{formatCurrency(record.totalEarnings)}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold">{formatCurrency(record.remaining)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-[150px]">
                            {record.notes ? (
                              <p className="text-sm text-muted-foreground">{record.notes}</p>
                            ) : isInitialAdvance ? (
                              <p className="text-sm text-muted-foreground">Initial Advance Amount</p>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            {!isInitialAdvance ? (
                              <>
                                <div className="h-8 w-8 flex items-center justify-center">
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center">
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
