/**
 * Storage abstraction layer for localStorage and Supabase
 */

import { calculateRemaining } from './calculations';

// Type definitions
export interface DailyRecord {
  id: string;
  date: string;
  basePay: number;
  bookings: number;
  bookingPay: number;
  inquiryPay: number;
  totalEarnings: number;
  advanceUsed: number;
  remaining: number;
  notes: string;
  action: string;
  createdAt: string;
  isInitialAdvance?: boolean;
}

export interface EarningSettings {
  basePay: number;
  perBooking: number;
  advanceBalance: number;
}

// Storage keys
const SETTINGS_KEY = 'earnings_settings';
const RECORDS_KEY = 'earnings_records';

// Default values
const DEFAULT_SETTINGS: EarningSettings = {
  basePay: 200,
  perBooking: 50,
  advanceBalance: 0,
};

/**
 * Get the storage backend mode from environment
 */
function getBackendMode(): 'local' | 'supabase' {
  return (process.env.NEXT_PUBLIC_BACKEND_MODE as 'local' | 'supabase') || 'local';
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current settings
 */
export async function getSettings(): Promise<EarningSettings> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    try {
      return JSON.parse(stored) as EarningSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * Save settings
 */
export async function saveSettings(settings: EarningSettings): Promise<void> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return;
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * List all records
 */
export async function listRecords(): Promise<DailyRecord[]> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(RECORDS_KEY);
    if (!stored) return [];
    
    try {
      const records = JSON.parse(stored) as DailyRecord[];
      // Sort by date descending (newest first)
      return records.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * Get record by ID
 */
export async function getRecord(id: string): Promise<DailyRecord | null> {
  const records = await listRecords();
  return records.find(r => r.id === id) || null;
}

/**
 * Get record by date
 */
export async function getRecordByDate(date: string): Promise<DailyRecord | null> {
  const records = await listRecords();
  return records.find(r => r.date === date) || null;
}

/**
 * Get the initial advance record
 */
export async function getInitialAdvanceRecord(): Promise<DailyRecord | null> {
  const records = await listRecords();
  return records.find(r => r.isInitialAdvance) || null;
}

/**
 * Save a new record
 */
export async function saveRecord(record: Omit<DailyRecord, 'id' | 'createdAt'>): Promise<DailyRecord> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') {
      throw new Error('Cannot save records on server side');
    }
    
    const records = await listRecords();
    
    // Calculate remaining balance
    let prevRemaining = 0;
    
    // First, check if there's an initial advance record
    const initialAdvance = await getInitialAdvanceRecord();
    
    if (initialAdvance) {
      // If there's an initial advance record, use it as the base
      // Find the most recent record before this date (excluding initial advance)
      const previousRecords = records.filter(r => 
        r.date < record.date && !r.isInitialAdvance
      );
      
      if (previousRecords.length > 0) {
        // Get the most recent previous record
        const mostRecent = previousRecords.sort((a, b) => b.date.localeCompare(a.date))[0];
        prevRemaining = mostRecent.remaining;
      } else {
        // No previous records, use initial advance remaining balance as starting point
        prevRemaining = initialAdvance.remaining;
      }
    } else {
      // No initial advance record, check for previous records
      const previousRecords = records.filter(r => r.date < record.date);
      if (previousRecords.length > 0) {
        // Get the most recent previous record
        const mostRecent = previousRecords.sort((a, b) => b.date.localeCompare(a.date))[0];
        prevRemaining = mostRecent.remaining;
      } else {
        // No previous records, use advance balance from settings as fallback
        const settings = await getSettings();
        prevRemaining = settings.advanceBalance;
      }
    }
    
    const newRecord: DailyRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
      remaining: calculateRemaining(prevRemaining, record.advanceUsed, record.totalEarnings),
    };
    
    records.push(newRecord);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    
    return newRecord;
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * Update an existing record
 */
export async function updateRecord(id: string, patch: Partial<Omit<DailyRecord, 'id' | 'createdAt'>>): Promise<DailyRecord> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') {
      throw new Error('Cannot update records on server side');
    }
    
    const records = await listRecords();
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Record not found');
    }
    
    const updated = { ...records[index], ...patch };
    
    // If financial values changed, recalculate remaining
    if (patch.advanceUsed !== undefined || patch.totalEarnings !== undefined || patch.date !== undefined) {
      // Get all records sorted by date
      const sortedRecords = [...records];
      sortedRecords[index] = updated;
      sortedRecords.sort((a, b) => a.date.localeCompare(b.date));
      
      // Recalculate remaining for this record and all subsequent records
      const recordIndex = sortedRecords.findIndex(r => r.id === id);
      
      // Get initial advance record
      const initialAdvance = await getInitialAdvanceRecord();
      
      for (let i = recordIndex; i < sortedRecords.length; i++) {
        if (sortedRecords[i].isInitialAdvance) {
          // Initial advance record - keep its remaining as is (it's the starting point)
          continue;
        }
        
        if (i === 0 || (initialAdvance && sortedRecords[i].date <= initialAdvance.date)) {
          // First record or record before/on initial advance date
          if (initialAdvance) {
            sortedRecords[i].remaining = calculateRemaining(
              initialAdvance.remaining,
              sortedRecords[i].advanceUsed,
              sortedRecords[i].totalEarnings
            );
          } else {
            // No initial advance, use settings
            const settings = await getSettings();
            sortedRecords[i].remaining = calculateRemaining(
              settings.advanceBalance,
              sortedRecords[i].advanceUsed,
              sortedRecords[i].totalEarnings
            );
          }
        } else {
          // Find the most recent previous record (excluding initial advance if it's after)
          let prevRemaining = 0;
          const prevRecords = sortedRecords.slice(0, i).filter(r => !r.isInitialAdvance || r.date <= sortedRecords[i].date);
          
          if (prevRecords.length > 0) {
            const mostRecent = prevRecords[prevRecords.length - 1];
            prevRemaining = mostRecent.remaining;
          } else if (initialAdvance) {
            prevRemaining = initialAdvance.remaining;
          } else {
            const settings = await getSettings();
            prevRemaining = settings.advanceBalance;
          }
          
          sortedRecords[i].remaining = calculateRemaining(
            prevRemaining,
            sortedRecords[i].advanceUsed,
            sortedRecords[i].totalEarnings
          );
        }
      }
      
      localStorage.setItem(RECORDS_KEY, JSON.stringify(sortedRecords));
      return sortedRecords.find(r => r.id === id)!;
    }
    
    records[index] = updated;
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    
    return updated;
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * Delete a record
 */
export async function deleteRecord(id: string): Promise<void> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') return;
    
    const records = await listRecords();
    const filtered = records.filter(r => r.id !== id);
    
    // Recalculate remaining balances for all records after deletion
    const sortedFiltered = filtered.sort((a, b) => a.date.localeCompare(b.date));
    const initialAdvance = await getInitialAdvanceRecord();
    const deletedRecord = records.find(r => r.id === id);
    
    // If we deleted the initial advance record, we need to recalculate from settings
    const isDeletedInitialAdvance = deletedRecord?.isInitialAdvance;
    
    for (let i = 0; i < sortedFiltered.length; i++) {
      if (sortedFiltered[i].isInitialAdvance) {
        // Initial advance record - keep its remaining as is
        continue;
      }
      
      if (i === 0 || (initialAdvance && !isDeletedInitialAdvance && sortedFiltered[i].date <= initialAdvance.date)) {
        // First record or record before/on initial advance date
        if (initialAdvance && !isDeletedInitialAdvance) {
          sortedFiltered[i].remaining = calculateRemaining(
            initialAdvance.remaining,
            sortedFiltered[i].advanceUsed,
            sortedFiltered[i].totalEarnings
          );
        } else {
          // No initial advance or it was deleted, use settings
          const settings = await getSettings();
          sortedFiltered[i].remaining = calculateRemaining(
            settings.advanceBalance,
            sortedFiltered[i].advanceUsed,
            sortedFiltered[i].totalEarnings
          );
        }
      } else {
        // Find the most recent previous record
        let prevRemaining = 0;
        const prevRecords = sortedFiltered.slice(0, i).filter(r => !r.isInitialAdvance || r.date <= sortedFiltered[i].date);
        
        if (prevRecords.length > 0) {
          const mostRecent = prevRecords[prevRecords.length - 1];
          prevRemaining = mostRecent.remaining;
        } else if (initialAdvance && !isDeletedInitialAdvance) {
          prevRemaining = initialAdvance.remaining;
        } else {
          const settings = await getSettings();
          prevRemaining = settings.advanceBalance;
        }
        
        sortedFiltered[i].remaining = calculateRemaining(
          prevRemaining,
          sortedFiltered[i].advanceUsed,
          sortedFiltered[i].totalEarnings
        );
      }
    }
    
    localStorage.setItem(RECORDS_KEY, JSON.stringify(sortedFiltered));
    return;
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * Get records for a specific date range
 */
export async function getRecordsByDateRange(startDate: string, endDate: string): Promise<DailyRecord[]> {
  const records = await listRecords();
  return records.filter(r => r.date >= startDate && r.date <= endDate);
}

/**
 * Create an initial advance record
 */
export async function createInitialAdvanceRecord(advanceAmount: number, date?: string): Promise<DailyRecord> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') {
      throw new Error('Cannot create records on server side');
    }
    
    const records = await listRecords();
    
    // Check if an initial advance record already exists
    const hasInitialAdvance = records.some(r => r.isInitialAdvance);
    if (hasInitialAdvance) {
      throw new Error('An initial advance record already exists');
    }
    
    const initialRecord: DailyRecord = {
      id: generateId(),
      date: date || new Date().toISOString().split('T')[0],
      basePay: 0,
      bookings: 0,
      bookingPay: 0,
      inquiryPay: 0,
      totalEarnings: 0,
      advanceUsed: 0,
      remaining: advanceAmount, // Set directly to the advance amount
      notes: `Initial Advance Amount`,
      action: 'Initial Advance',
      isInitialAdvance: true,
      createdAt: new Date().toISOString(),
    };
    
    records.push(initialRecord);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    
    return initialRecord;
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}

/**
 * Clear all data (useful for testing)
 */
export async function clearAllData(): Promise<void> {
  if (getBackendMode() === 'local') {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(RECORDS_KEY);
    return;
  }
  
  // TODO: Implement Supabase mode
  throw new Error('Supabase mode not yet implemented');
}
