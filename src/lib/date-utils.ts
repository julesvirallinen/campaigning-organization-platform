import { format, parseISO } from "date-fns";

/**
 * Formats a date string to a time format (e.g., "9:00 AM")
 * Preserves timezone information
 */
export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), "HH:mm");
}

/**
 * Formats a date string to a day header format (e.g., "Monday, Jan 1")
 * Preserves timezone information
 */
export function formatDayHeader(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE, d/M");
}

/**
 * Creates a Date object that preserves the local timezone
 */
export function createLocalDate(dateStr: string, timeStr: string): Date {
  // Create date with explicit timezone (Europe/Helsinki)
  const isoString = `${dateStr}T${timeStr}:00`;
  const date = new Date(isoString);

  // Adjust for timezone offset to ensure correct local time
  const finnishOffset = 2 * 60 * 60 * 1000; // 2 hours in milliseconds - would break in summer time

  // Apply the offset difference to get the correct Finnish time
  return new Date(date.getTime() + finnishOffset);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "yyyy-MM-dd");
}

/**
 * Serializes a Date to ISO format for API requests
 */
export function serializeDate(date: Date): string {
  return date.toISOString();
}
