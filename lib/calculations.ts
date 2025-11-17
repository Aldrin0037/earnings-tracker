/**
 * Core business logic for earnings calculations
 */

/**
 * Calculate the total booking pay based on number of bookings
 * @param bookings - Number of bookings completed
 * @param perBooking - Payment per booking (default: 50 PHP)
 * @returns Total booking pay
 */
export function calculateBookingPay(bookings: number, perBooking: number = 50): number {
  if (bookings < 0) return 0;
  return bookings * perBooking;
}

/**
 * Calculate total earnings for the day
 * @param basePay - Base daily pay
 * @param bookingPay - Total booking commission
 * @param inquiryPay - Additional inquiry pay (optional)
 * @returns Total earnings
 */
export function calculateTotalEarnings(
  basePay: number, 
  bookingPay: number, 
  inquiryPay: number = 0
): number {
  return basePay + bookingPay + inquiryPay;
}

/**
 * Calculate remaining balance after advance usage
 * @param prevRemaining - Previous remaining balance
 * @param advanceUsedToday - Advance amount used today
 * @param totalEarnedToday - Total earnings for today
 * @returns New remaining balance
 */
export function calculateRemaining(
  prevRemaining: number, 
  advanceUsedToday: number, 
  totalEarnedToday: number
): number {
  // Formula: Previous Remaining - Total Earned Today
  // The total earnings reduce the remaining advance balance
  // If advanceUsedToday is 0 (simplified flow), we just subtract total earnings
  if (advanceUsedToday === 0) {
    return prevRemaining - totalEarnedToday;
  }
  // Legacy formula for when advance is explicitly used
  return prevRemaining - advanceUsedToday + totalEarnedToday;
}

/**
 * Format currency for display (PHP)
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency string to number
 * @param currencyStr - Currency string to parse
 * @returns Numeric value
 */
export function parseCurrency(currencyStr: string): number {
  // Remove currency symbol and spaces, then parse
  const cleaned = currencyStr.replace(/[₱,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
