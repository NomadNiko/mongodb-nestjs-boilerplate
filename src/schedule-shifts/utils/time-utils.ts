export interface TimeRange {
  start: string;
  end: string;
}

/**
 * Validates if a time string is in HH:MM format
 */
export function isValidTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

/**
 * Converts time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if two time ranges overlap, supporting overnight shifts
 */
export function timeRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  let start1 = timeToMinutes(range1.start);
  let end1 = timeToMinutes(range1.end);
  let start2 = timeToMinutes(range2.start);
  let end2 = timeToMinutes(range2.end);
  
  // Handle overnight shifts (end time is less than start time)
  if (end1 <= start1) {
    end1 += 24 * 60; // Add 24 hours in minutes
  }
  if (end2 <= start2) {
    end2 += 24 * 60; // Add 24 hours in minutes
  }
  
  // Check for overlap: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Calculates the duration of a shift in minutes
 */
export function calculateShiftDuration(startTime: string, endTime: string): number {
  let start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);
  
  // Handle overnight shifts
  if (end <= start) {
    end += 24 * 60;
  }
  
  return end - start;
}

/**
 * Formats duration in minutes to a readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}