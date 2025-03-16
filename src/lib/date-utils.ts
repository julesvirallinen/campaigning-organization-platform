import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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

export function createLocalDate(dateStr: string, timeStr: string): Date {
  const isoString = `${dateStr}T${timeStr}:00`;

  const date = new Date(isoString);

  const finnishOffset = -120; // -120 minutes for UTC+2

  return new Date(date.getTime() + finnishOffset * 60 * 1000);
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
 * This is used when retrieving dates from the database
 */
export function toFinnishTime(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}
