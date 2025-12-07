/**
 * Time Utilities
 * Helper functions for time validation and conversion
 */

/**
 * Validate time string format (HH:mm)
 * @param timeString - Time string to validate
 * @returns true if valid, false otherwise
 * @example
 * isValidTimeFormat("08:00") // true
 * isValidTimeFormat("25:00") // false
 * isValidTimeFormat("8:00")  // true
 */
export function isValidTimeFormat(timeString: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
}

/**
 * Convert time string (HH:mm) to Date object
 * @param timeString - Time string in HH:mm format
 * @returns Date object with time set
 * @example
 * timeStringToDate("08:00") // Date with 08:00:00
 * timeStringToDate("22:30") // Date with 22:30:00
 */
export function timeStringToDate(timeString: string): Date {
    const parts = timeString.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

/**
 * Convert Date object to time string (HH:mm)
 * @param date - Date object
 * @returns Time string in HH:mm format
 * @example
 * dateToTimeString(new Date("2024-01-01T08:00:00")) // "08:00"
 */
export function dateToTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

/**
 * Validate time range (opening time must be before closing time)
 * @param opening_time - Opening time string (HH:mm)
 * @param closing_time - Closing time string (HH:mm)
 * @returns Error message if invalid, null if valid
 * @example
 * validateTimeRange("08:00", "22:00") // null (valid)
 * validateTimeRange("22:00", "08:00") // "Giờ mở cửa phải nhỏ hơn giờ đóng cửa"
 */
export function validateTimeRange(
    opening_time?: string,
    closing_time?: string
): string | null {
    if (!opening_time || !closing_time) {
        return null;
    }

    const openParts = opening_time.split(":").map(Number);
    const closeParts = closing_time.split(":").map(Number);

    const openHours = openParts[0] ?? 0;
    const openMinutes = openParts[1] ?? 0;
    const closeHours = closeParts[0] ?? 0;
    const closeMinutes = closeParts[1] ?? 0;

    const openTime = openHours * 60 + openMinutes;
    const closeTime = closeHours * 60 + closeMinutes;

    if (openTime >= closeTime) {
        return "Giờ mở cửa phải nhỏ hơn giờ đóng cửa";
    }

    return null;
}

/**
 * Get time difference in minutes
 * @param startTime - Start time string (HH:mm)
 * @param endTime - End time string (HH:mm)
 * @returns Difference in minutes
 * @example
 * getTimeDifferenceInMinutes("08:00", "10:00") // 120
 * getTimeDifferenceInMinutes("22:00", "23:30") // 90
 */
export function getTimeDifferenceInMinutes(
    startTime: string,
    endTime: string
): number {
    const startParts = startTime.split(":").map(Number);
    const endParts = endTime.split(":").map(Number);

    const startHours = startParts[0] ?? 0;
    const startMinutes = startParts[1] ?? 0;
    const endHours = endParts[0] ?? 0;
    const endMinutes = endParts[1] ?? 0;

    const start = startHours * 60 + startMinutes;
    const end = endHours * 60 + endMinutes;

    return end - start;
}

/**
 * Check if a time is within a time range
 * @param time - Time to check (HH:mm)
 * @param startTime - Start time (HH:mm)
 * @param endTime - End time (HH:mm)
 * @returns true if time is within range, false otherwise
 * @example
 * isTimeInRange("10:00", "08:00", "18:00") // true
 * isTimeInRange("20:00", "08:00", "18:00") // false
 */
export function isTimeInRange(
    time: string,
    startTime: string,
    endTime: string
): boolean {
    const timeParts = time.split(":").map(Number);
    const startParts = startTime.split(":").map(Number);
    const endParts = endTime.split(":").map(Number);

    const hours = timeParts[0] ?? 0;
    const minutes = timeParts[1] ?? 0;
    const startHours = startParts[0] ?? 0;
    const startMinutes = startParts[1] ?? 0;
    const endHours = endParts[0] ?? 0;
    const endMinutes = endParts[1] ?? 0;

    const timeInMinutes = hours * 60 + minutes;
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
}

/**
 * Add minutes to a time string
 * @param timeString - Time string (HH:mm)
 * @param minutesToAdd - Minutes to add
 * @returns New time string (HH:mm)
 * @example
 * addMinutesToTime("08:00", 30) // "08:30"
 * addMinutesToTime("23:45", 30) // "00:15"
 */
export function addMinutesToTime(timeString: string, minutesToAdd: number): string {
    const date = timeStringToDate(timeString);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return dateToTimeString(date);
}
