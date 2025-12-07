/**
 * Validation Utilities
 * Helper functions for common validation tasks
 */

/**
 * Validate UUID v4 format
 * @param uuid - String to validate
 * @returns true if valid UUID v4, false otherwise
 * @example
 * isValidUUID("123e4567-e89b-12d3-a456-426614174000") // true
 * isValidUUID("invalid-uuid") // false
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email, false otherwise
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email") // false
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Vietnamese format)
 * @param phone - Phone number to validate
 * @returns true if valid phone, false otherwise
 * @example
 * isValidPhone("0123456789") // true
 * isValidPhone("+84123456789") // true
 * isValidPhone("123") // false
 */
export function isValidPhone(phone: string): boolean {
    // Vietnamese phone: 10 digits starting with 0, or +84 followed by 9 digits
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns true if valid URL, false otherwise
 * @example
 * isValidURL("https://example.com") // true
 * isValidURL("not-a-url") // false
 */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate coordinates (latitude and longitude)
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Error message if invalid, null if valid
 * @example
 * validateCoordinates(21.0285, 105.8542) // null (valid)
 * validateCoordinates(100, 200) // "Tọa độ không hợp lệ"
 */
export function validateCoordinates(lat: number, lng: number): string | null {
    if (lat < -90 || lat > 90) {
        return "Vĩ độ phải từ -90 đến 90";
    }

    if (lng < -180 || lng > 180) {
        return "Kinh độ phải từ -180 đến 180";
    }

    return null;
}

/**
 * Validate string length
 * @param str - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @param fieldName - Field name for error message
 * @returns Error message if invalid, null if valid
 * @example
 * validateStringLength("Hello", 3, 10, "Name") // null (valid)
 * validateStringLength("Hi", 3, 10, "Name") // "Name phải có ít nhất 3 ký tự"
 */
export function validateStringLength(
    str: string,
    min: number,
    max: number,
    fieldName: string = "Trường"
): string | null {
    const trimmed = str.trim();

    if (trimmed.length < min) {
        return `${fieldName} phải có ít nhất ${min} ký tự`;
    }

    if (trimmed.length > max) {
        return `${fieldName} không được vượt quá ${max} ký tự`;
    }

    return null;
}

/**
 * Validate number range
 * @param num - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Field name for error message
 * @returns Error message if invalid, null if valid
 * @example
 * validateNumberRange(5, 1, 10, "Age") // null (valid)
 * validateNumberRange(15, 1, 10, "Age") // "Age phải từ 1 đến 10"
 */
export function validateNumberRange(
    num: number,
    min: number,
    max: number,
    fieldName: string = "Giá trị"
): string | null {
    if (num < min || num > max) {
        return `${fieldName} phải từ ${min} đến ${max}`;
    }

    return null;
}

/**
 * Validate positive integer
 * @param num - Number to validate
 * @param fieldName - Field name for error message
 * @returns Error message if invalid, null if valid
 * @example
 * validatePositiveInteger(5, "ID") // null (valid)
 * validatePositiveInteger(-1, "ID") // "ID phải là số nguyên dương"
 * validatePositiveInteger(3.5, "ID") // "ID phải là số nguyên dương"
 */
export function validatePositiveInteger(
    num: number,
    fieldName: string = "Giá trị"
): string | null {
    if (!Number.isInteger(num) || num < 1) {
        return `${fieldName} phải là số nguyên dương`;
    }

    return null;
}

/**
 * Sanitize string (remove special characters, trim)
 * @param str - String to sanitize
 * @returns Sanitized string
 * @example
 * sanitizeString("  Hello <script>  ") // "Hello script"
 */
export function sanitizeString(str: string): string {
    return str
        .trim()
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/[<>]/g, ""); // Remove < and >
}

/**
 * Check if string contains only alphanumeric characters
 * @param str - String to check
 * @returns true if alphanumeric, false otherwise
 * @example
 * isAlphanumeric("Hello123") // true
 * isAlphanumeric("Hello@123") // false
 */
export function isAlphanumeric(str: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(str);
}

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Error message if invalid, null if valid
 * @example
 * validateDateRange(new Date("2024-01-01"), new Date("2024-12-31")) // null
 * validateDateRange(new Date("2024-12-31"), new Date("2024-01-01")) // "Ngày bắt đầu phải trước ngày kết thúc"
 */
export function validateDateRange(startDate: Date, endDate: Date): string | null {
    if (startDate >= endDate) {
        return "Ngày bắt đầu phải trước ngày kết thúc";
    }

    return null;
}
