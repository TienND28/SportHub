/**
 * User Module Constants
 * Centralized constants for user-related operations
 */

/**
 * User roles
 */
export const USER_ROLES = {
    CUSTOMER: 'customer',
    OWNER: 'owner',
    ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Gender options
 */
export const GENDERS = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
} as const;

export type Gender = typeof GENDERS[keyof typeof GENDERS];

/**
 * Available sports
 */
export const SPORTS = {
    FOOTBALL: 'football',
    BADMINTON: 'badminton',
    PICKLEBALL: 'pickleball',
    BASKETBALL: 'basketball',
    VOLLEYBALL: 'volleyball',
} as const;

export type Sport = typeof SPORTS[keyof typeof SPORTS];

/**
 * Sort fields for user queries
 */
export const USER_SORT_FIELDS = {
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    FULL_NAME: 'full_name',
    EMAIL: 'email',
} as const;

export type UserSortField = typeof USER_SORT_FIELDS[keyof typeof USER_SORT_FIELDS];

/**
 * Sort orders
 */
export const SORT_ORDERS = {
    ASC: 'asc',
    DESC: 'desc',
} as const;

export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

/**
 * Password constraints
 */
export const PASSWORD_CONSTRAINTS = {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/**
 * User profile constraints
 */
export const PROFILE_CONSTRAINTS = {
    FULL_NAME_MIN_LENGTH: 2,
    FULL_NAME_MAX_LENGTH: 100,
    MAX_FAVORITE_SPORTS: 10,
} as const;
