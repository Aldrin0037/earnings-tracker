import { z } from "zod";

export const earningsFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  basePay: z.coerce.number()
    .min(0, "Base pay must be a positive number")
    .multipleOf(0.01, "Base pay must have at most 2 decimal places"),
  bookings: z.coerce.number()
    .int("Number of bookings must be a whole number")
    .min(0, "Bookings cannot be negative"),
  inquiryPay: z.coerce.number()
    .min(0, "Inquiry pay must be a positive number")
    .multipleOf(0.01, "Inquiry pay must have at most 2 decimal places")
    .optional()
    .default(0),
  advanceUsed: z.coerce.number()
    .min(0, "Advance used must be a positive number")
    .multipleOf(0.01, "Advance used must have at most 2 decimal places")
    .optional()
    .default(0),
  notes: z.string().optional().default(""),
  action: z.string().optional().default(""),
});

export type EarningsFormData = z.infer<typeof earningsFormSchema>;

export const settingsFormSchema = z.object({
  basePay: z.coerce.number()
    .min(0, "Base pay must be a positive number")
    .multipleOf(0.01, "Base pay must have at most 2 decimal places"),
  perBooking: z.coerce.number()
    .min(0, "Per booking rate must be a positive number")
    .multipleOf(0.01, "Per booking rate must have at most 2 decimal places"),
  advanceBalance: z.coerce.number()
    .min(0, "Advance balance must be a positive number")
    .multipleOf(0.01, "Advance balance must have at most 2 decimal places"),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
