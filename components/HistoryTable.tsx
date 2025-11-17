"use client";

import * as React from "react";
import { DailyRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Search, 
  Trash2,
  Edit,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface HistoryTableProps {
  records: DailyRecord[];
  onDelete?: (id: string) => void | Promise<void>;
  onEdit?: (record: DailyRecord) => void;
  isLoading?: boolean;
}

export function HistoryTable({
  records,
  onDelete,
  onEdit,
  isLoading = false
}: HistoryTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const recordsPerPage = 10;

  // Pagination
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + recordsPerPage);

  const handleDeleteClick = (id: string) => {
    if (onDelete && window.confirm("Are you sure you want to delete this record?")) {
      onDelete(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings History</CardTitle>
        <CardDescription>
          Showing {paginatedRecords.length} of {records.length} records
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
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      No records found
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => {
                    const isInitialAdvance = record.isInitialAdvance;
                    // Get per booking rate from settings or use default
                    const perBookingRate = record.bookingPay > 0 && record.bookings > 0 
                      ? record.bookingPay / record.bookings 
                      : 50;
                    const inquiryRate = record.basePay; // Fixed daily inquiry pay
                    const inquiries = record.inquiryPay > 0 ? 1 : 0; // Always 1 inquiry per day (the base pay)
                    
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
                            {record.notes && (
                              <p className="text-sm text-muted-foreground">{record.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            {!isInitialAdvance && (
                              <>
                                {onEdit && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEdit(record)}
                                    disabled={isLoading}
                                    className="h-8 w-8 p-0"
                                    aria-label="Edit record"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteClick(record.id)}
                                    disabled={isLoading}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    aria-label="Delete record"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
