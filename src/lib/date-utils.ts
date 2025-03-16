import { format, parseISO } from "date-fns";

/**
 * Formats a date string to a time format (e.g., "9:00 AM")
 * Preserves timezone information
 */
export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), "h:mm a");
}

/**
 * Formats a date string to a day header format (e.g., "Monday, Jan 1")
 * Preserves timezone information
 */
export function formatDayHeader(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE, MMM d");
}

/**
 * Creates a Date object that preserves the local timezone
 */
export function createLocalDate(dateStr: string, timeStr: string): Date {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  return date;
}

/**
 * Serializes a Date to ISO format for API requests
 */
export function serializeDate(date: Date): string {
  return date.toISOString();
}
