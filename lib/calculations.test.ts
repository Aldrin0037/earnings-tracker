/**
 * Unit tests for calculation functions
 * Testing all core business logic for earnings calculations
 */

import {
  calculateBookingPay,
  calculateTotalEarnings,
  calculateRemaining,
  formatCurrency,
  parseCurrency,
} from './calculations';

describe('calculateBookingPay', () => {
  it('should calculate correct booking pay with default rate', () => {
    expect(calculateBookingPay(5)).toBe(250); // 5 bookings * 50 PHP
    expect(calculateBookingPay(10)).toBe(500); // 10 bookings * 50 PHP
    expect(calculateBookingPay(0)).toBe(0); // 0 bookings
  });

  it('should calculate correct booking pay with custom rate', () => {
    expect(calculateBookingPay(5, 100)).toBe(500); // 5 bookings * 100 PHP
    expect(calculateBookingPay(3, 75)).toBe(225); // 3 bookings * 75 PHP
    expect(calculateBookingPay(1, 200)).toBe(200); // 1 booking * 200 PHP
  });

  it('should handle negative bookings by returning 0', () => {
    expect(calculateBookingPay(-5)).toBe(0);
    expect(calculateBookingPay(-1, 50)).toBe(0);
    expect(calculateBookingPay(-10, 100)).toBe(0);
  });

  it('should handle decimal bookings correctly', () => {
    expect(calculateBookingPay(2.5, 50)).toBe(125); // 2.5 bookings * 50 PHP
    expect(calculateBookingPay(1.5, 100)).toBe(150); // 1.5 bookings * 100 PHP
  });

  it('should handle zero rate', () => {
    expect(calculateBookingPay(5, 0)).toBe(0);
    expect(calculateBookingPay(10, 0)).toBe(0);
  });
});

describe('calculateTotalEarnings', () => {
  it('should calculate total earnings with all components', () => {
    expect(calculateTotalEarnings(200, 250, 100)).toBe(550);
    // 200 base + 250 booking + 100 inquiry = 550
  });

  it('should calculate total earnings without inquiry pay', () => {
    expect(calculateTotalEarnings(200, 250)).toBe(450);
    // 200 base + 250 booking + 0 inquiry = 450
  });

  it('should calculate total earnings with explicit zero inquiry pay', () => {
    expect(calculateTotalEarnings(200, 250, 0)).toBe(450);
  });

  it('should handle zero values correctly', () => {
    expect(calculateTotalEarnings(0, 0, 0)).toBe(0);
    expect(calculateTotalEarnings(200, 0, 0)).toBe(200);
    expect(calculateTotalEarnings(0, 250, 0)).toBe(250);
    expect(calculateTotalEarnings(0, 0, 100)).toBe(100);
  });

  it('should handle large numbers', () => {
    expect(calculateTotalEarnings(1000, 5000, 2000)).toBe(8000);
  });

  it('should handle decimal values', () => {
    expect(calculateTotalEarnings(200.50, 250.75, 100.25)).toBe(551.5);
  });
});

describe('calculateRemaining', () => {
  it('should calculate remaining balance correctly with positive advance', () => {
    // Previous: 1000, Advance Used: 200, Earned: 500
    // Result: 1000 - 200 + 500 = 1300
    expect(calculateRemaining(1000, 200, 500)).toBe(1300);
  });

  it('should calculate remaining balance with no advance used', () => {
    // Previous: 500, Advance Used: 0, Earned: 300
    // Result: 500 - 0 + 300 = 800
    expect(calculateRemaining(500, 0, 300)).toBe(800);
  });

  it('should handle negative remaining balance', () => {
    // Previous: 100, Advance Used: 500, Earned: 200
    // Result: 100 - 500 + 200 = -200
    expect(calculateRemaining(100, 500, 200)).toBe(-200);
  });

  it('should handle zero previous balance', () => {
    // Previous: 0, Advance Used: 100, Earned: 300
    // Result: 0 - 100 + 300 = 200
    expect(calculateRemaining(0, 100, 300)).toBe(200);
  });

  it('should handle all zeros', () => {
    expect(calculateRemaining(0, 0, 0)).toBe(0);
  });

  it('should handle negative previous balance', () => {
    // Previous: -500, Advance Used: 0, Earned: 600
    // Result: -500 - 0 + 600 = 100
    expect(calculateRemaining(-500, 0, 600)).toBe(100);
  });

  it('should handle decimal values', () => {
    // Previous: 1000.50, Advance Used: 250.25, Earned: 500.75
    // Result: 1000.50 - 250.25 + 500.75 = 1251
    expect(calculateRemaining(1000.50, 250.25, 500.75)).toBe(1251);
  });

  it('should handle realistic daily scenarios', () => {
    // Scenario 1: Starting with advance, using some, earning more
    expect(calculateRemaining(2000, 300, 450)).toBe(2150);

    // Scenario 2: Negative balance recovering
    expect(calculateRemaining(-1000, 0, 500)).toBe(-500);

    // Scenario 3: Using more advance than earned
    expect(calculateRemaining(1500, 600, 400)).toBe(1300);
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('₱1,000.00');
    expect(formatCurrency(500)).toBe('₱500.00');
    expect(formatCurrency(250.50)).toBe('₱250.50');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('₱0.00');
  });

  it('should format negative numbers correctly', () => {
    expect(formatCurrency(-500)).toBe('-₱500.00');
    expect(formatCurrency(-1000.50)).toBe('-₱1,000.50');
  });

  it('should include thousands separator', () => {
    expect(formatCurrency(10000)).toBe('₱10,000.00');
    expect(formatCurrency(100000)).toBe('₱100,000.00');
    expect(formatCurrency(1000000)).toBe('₱1,000,000.00');
  });

  it('should always show two decimal places', () => {
    expect(formatCurrency(100)).toBe('₱100.00');
    expect(formatCurrency(100.1)).toBe('₱100.10');
    expect(formatCurrency(100.99)).toBe('₱100.99');
  });

  it('should round to two decimal places', () => {
    expect(formatCurrency(100.125)).toBe('₱100.13');
    expect(formatCurrency(100.124)).toBe('₱100.12');
  });

  it('should handle very large numbers', () => {
    expect(formatCurrency(9999999.99)).toBe('₱9,999,999.99');
  });

  it('should handle very small decimals', () => {
    expect(formatCurrency(0.01)).toBe('₱0.01');
    expect(formatCurrency(0.99)).toBe('₱0.99');
  });
});

describe('parseCurrency', () => {
  it('should parse formatted currency strings', () => {
    expect(parseCurrency('₱1,000.00')).toBe(1000);
    expect(parseCurrency('₱500.50')).toBe(500.50);
    expect(parseCurrency('₱250.25')).toBe(250.25);
  });

  it('should parse currency without thousands separator', () => {
    expect(parseCurrency('₱100.00')).toBe(100);
    expect(parseCurrency('₱50.75')).toBe(50.75);
  });

  it('should parse currency without symbol', () => {
    expect(parseCurrency('1000.00')).toBe(1000);
    expect(parseCurrency('500.50')).toBe(500.50);
  });

  it('should parse currency with spaces', () => {
    expect(parseCurrency('₱ 1,000.00')).toBe(1000);
    expect(parseCurrency('₱ 500 . 50')).toBe(500.50);
  });

  it('should handle negative currency', () => {
    expect(parseCurrency('-₱500.00')).toBe(-500);
    expect(parseCurrency('-₱1,000.50')).toBe(-1000.50);
  });

  it('should return 0 for invalid strings', () => {
    expect(parseCurrency('invalid')).toBe(0);
    expect(parseCurrency('abc')).toBe(0);
    expect(parseCurrency('')).toBe(0);
  });

  it('should handle plain numbers', () => {
    expect(parseCurrency('1000')).toBe(1000);
    expect(parseCurrency('500.50')).toBe(500.50);
  });

  it('should be inverse of formatCurrency for valid inputs', () => {
    const testValues = [0, 100, 500.50, 1000, 10000, 99999.99];
    testValues.forEach(value => {
      const formatted = formatCurrency(value);
      const parsed = parseCurrency(formatted);
      expect(parsed).toBeCloseTo(value, 2);
    });
  });

  it('should handle edge cases', () => {
    expect(parseCurrency('₱0.00')).toBe(0);
    expect(parseCurrency('₱')).toBe(0);
    expect(parseCurrency(',')).toBe(0);
  });
});

describe('Integration tests - Real-world scenarios', () => {
  it('should calculate a complete daily earnings scenario', () => {
    // Scenario: 5 bookings at 50 PHP each, 200 base pay, 100 inquiry pay
    const bookings = 5;
    const perBooking = 50;
    const basePay = 200;
    const inquiryPay = 100;

    const bookingPay = calculateBookingPay(bookings, perBooking);
    expect(bookingPay).toBe(250);

    const totalEarnings = calculateTotalEarnings(basePay, bookingPay, inquiryPay);
    expect(totalEarnings).toBe(550);

    const prevRemaining = 1000;
    const advanceUsed = 200;
    const remaining = calculateRemaining(prevRemaining, advanceUsed, totalEarnings);
    expect(remaining).toBe(1350);
  });

  it('should handle a day with no bookings', () => {
    const bookingPay = calculateBookingPay(0, 50);
    expect(bookingPay).toBe(0);

    const totalEarnings = calculateTotalEarnings(200, bookingPay, 0);
    expect(totalEarnings).toBe(200);

    const remaining = calculateRemaining(500, 0, totalEarnings);
    expect(remaining).toBe(700);
  });

  it('should handle recovering from negative balance', () => {
    const bookingPay = calculateBookingPay(10, 50);
    expect(bookingPay).toBe(500);

    const totalEarnings = calculateTotalEarnings(200, bookingPay, 150);
    expect(totalEarnings).toBe(850);

    const remaining = calculateRemaining(-1000, 0, totalEarnings);
    expect(remaining).toBe(-150); // Still negative but improving
  });

  it('should format and parse currency consistently', () => {
    const bookingPay = calculateBookingPay(7, 50);
    const formatted = formatCurrency(bookingPay);
    expect(formatted).toBe('₱350.00');

    const parsed = parseCurrency(formatted);
    expect(parsed).toBe(350);
  });
});
