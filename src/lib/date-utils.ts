import { format, parseISO } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/Helsinki";

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
 * Creates a Date object in Finnish timezone
 * Properly handles timezone conversion for storage
 */
export function createLocalDate(dateStr: string, timeStr: string): Date {
  // Create a date string in ISO format
  const isoString = `${dateStr}T${timeStr}:00`;

  // Convert the local Finnish time to UTC for storage
  return fromZonedTime(isoString, TIMEZONE);
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

/**
 * Converts a UTC date to Finnish time for display
 */
export function toFinnishTime(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}
