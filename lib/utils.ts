import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Date object to YYYY-MM-DD string using local time (not UTC)
 * This prevents timezone issues where toISOString() can return the previous day
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string to a Date object using local time (not UTC)
 * This prevents timezone issues where new Date("YYYY-MM-DD") interprets as UTC
 * and can shift the date by one day when converted to local time
 */
export function parseDateLocal(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Handle ISO strings with time
  if (dateStr.includes('T')) {
    const date = new Date(dateStr);
    // Return a new date using local components to avoid timezone shift
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  
  // Handle YYYY-MM-DD format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Create date in local timezone to avoid UTC interpretation
      return new Date(year, month, day);
    }
  }
  
  // Fallback to regular Date parsing
  return new Date(dateStr);
}
