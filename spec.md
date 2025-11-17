# Earnings Tracker App Specification

## Goal
Build a personal earnings tracker for daily inquiry and booking work.

### Core Features:
- Track daily base pay (200 PHP default)
- Track per-booking commission (50 PHP default)
- Track inquiry pay (optional)
- Track advance payments and remaining balance
- Maintain daily history with date filtering
- Export daily report as PNG (html2canvas) and optional PDF (jsPDF/react-pdf)
- Single-user local-first mode (localStorage). Optional Supabase mode for multi-user.

## Data Models

### DailyRecord:
```typescript
{
  id: string;
  date: string;
  basePay: number; // default 200
  bookings: number;
  bookingPay: number; // bookings * 50
  inquiryPay: number;
  totalEarnings: number;
  advanceUsed: number;
  remaining: number;
  notes: string;
  action: string;
  createdAt: string;
}
```

### EarningSettings:
```typescript
{
  basePay: number;
  perBooking: number;
  advanceBalance: number;
}
```

## Technical Stack
- TypeScript
- Next.js App Router
- Tailwind CSS + shadcn/ui
- react-hook-form + zod
- localStorage (default) / Supabase (optional)
- html2canvas for PNG export
- jsPDF for PDF export (optional)

## Core Business Logic

### Calculations (/lib/calculations.ts):
- calculateBookingPay(bookings, perBooking=50)
- calculateTotalEarnings(basePay, bookingPay, inquiryPay=0)
- calculateRemaining(prevRemaining, advanceUsedToday, totalEarnedToday)

### Storage Interface (/lib/storage.ts):
- getSettings()
- saveSettings(settings)
- listRecords()
- saveRecord(record)
- updateRecord(id, patch)
- deleteRecord(id)

Implementation: use localStorage if NEXT_PUBLIC_BACKEND_MODE='local', Supabase if 'supabase'.

## UI Components

1. **EarningsForm**: Daily entry form using react-hook-form + zod
2. **EarningsCard**: Shows daily totals
3. **SettingsCard**: Updates base pay, perBooking, advanceBalance
4. **HistoryTable**: List all records, supports filtering and pagination
5. **ExportButton**: Exports EarningsCard as PNG (html2canvas), optional PDF

## Pages

1. **/dashboard**: Main page with EarningsForm and EarningsCard
2. **/settings**: Settings management page
3. **/history**: Records history with filtering and export

## Environment Configuration
- NEXT_PUBLIC_BACKEND_MODE: 'local' | 'supabase'
- NEXT_PUBLIC_SUPABASE_URL: Supabase URL (if enabled)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key (if enabled)

## Testing Requirements
- Confirm calculations: bookingPay, totalEarnings, remaining
- Test multiple records creation and deletion
- Test settings updates
- Test export (PNG, optional PDF)
- Test local-first mode fully; test Supabase mode if enabled

## Deployment
- Vercel recommended
- Set NEXT_PUBLIC_BACKEND_MODE=local by default
- Use .env.local for secrets (Supabase keys if enabled)
