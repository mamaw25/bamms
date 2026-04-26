/**
 * Centralized Application Configuration Constants
 * 
 * This file consolidates all magic numbers, strings, and configuration values
 * used throughout the application. Update values here instead of scattering them
 * throughout the codebase.
 */

// ============================================================================
// TIME-RELATED CONSTANTS (milliseconds unless noted)
// ============================================================================

export const TIME_CONSTANTS = {
  // Offline synchronization
  SYNC_RETRY_INTERVAL: 5000,           // Retry sync every 5 seconds
  SYNC_TIMEOUT: 30000,                 // Sync operation timeout
  AUTO_SYNC_INTERVAL: 60000,           // Auto-sync interval (1 minute)
  SYNC_DEBOUNCE: 1000,                 // Debounce sync requests

  // Session management
  SESSION_TIMEOUT: 1800000,            // 30 minutes
  SESSION_CHECK_INTERVAL: 60000,       // Check session every minute

  // UI interactions
  DEBOUNCE_DELAY: 300,                 // Input debounce delay
  ANIMATION_DURATION: 300,             // Standard animation duration
  TOAST_DURATION: 3000,                // Toast/notification duration
  MODAL_ANIMATION_DURATION: 300,       // Modal animation duration

  // Real-time subscriptions
  REALTIME_SUBSCRIBE_TIMEOUT: 10000,   // Subscription timeout
  REALTIME_RECONNECT_DELAY: 3000,      // Reconnect delay after disconnect

  // Attendance-specific
  CLOCK_IN_ADVANCE_SECONDS: 900,       // Max 15 minutes early clock-in
  LATE_THRESHOLD_MINUTES: 15,          // Late if checked in after this

  // Time format strings
  TIME_FORMAT_12H: 'hh:mm A',          // 12-hour format (e.g., 02:30 PM)
  TIME_FORMAT_24H: 'HH:mm',            // 24-hour format (e.g., 14:30)
} as const;

// ============================================================================
// UI CONSTANTS & THRESHOLDS
// ============================================================================

export const UI_THRESHOLDS = {
  // When to show loading indicators
  LONG_OPERATION_THRESHOLD: 3000,      // Show spinner if > 3 seconds
  QUICK_OPERATION_THRESHOLD: 500,      // Don't show spinner for < 0.5 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Sync progress display
  MIN_PROGRESS_UPDATE: 5,               // Minimum % change to update UI
  PROGRESS_BAR_ANIMATION_MS: 300,      // Smooth progress bar animation
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Network/Sync errors
  SYNC_FAILED: 'Synchronization failed. Please check your connection.',
  SYNC_TIMEOUT: 'Sync operation timed out. Will retry automatically.',
  CONNECTION_LOST: 'Connection lost. Working offline.',
  CONNECTION_RESTORED: 'Connection restored. Syncing data...',

  // Authentication errors
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',

  // Profile/User errors
  PROFILE_NOT_FOUND: 'User profile not found.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
  USER_NOT_FOUND: 'User account not found.',
  EMAIL_ALREADY_REGISTERED: 'This email is already registered.',

  // Attendance errors
  CLOCK_IN_FAILED: 'Failed to record check-in. Please try again.',
  CLOCK_OUT_FAILED: 'Failed to record clock-out. Please try again.',
  ATTENDANCE_NOT_FOUND: 'Attendance record not found.',
  ALREADY_CLOCKED_IN: 'You are already clocked in.',
  NOT_CLOCKED_IN: 'You are not currently clocked in.',

  // Leave request errors
  LEAVE_REQUEST_FAILED: 'Failed to submit leave request. Please try again.',
  INVALID_DATE_RANGE: 'Invalid date range. Start date must be before end date.',
  OVERLAPPING_LEAVE: 'This date overlaps with an existing leave request.',
  LEAVE_REQUEST_NOT_FOUND: 'Leave request not found.',

  // Generic errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  INVALID_INPUT: 'Invalid input provided.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  CLOCK_IN_SUCCESS: 'Successfully checked in.',
  CLOCK_OUT_SUCCESS: 'Successfully clocked out.',
  WFH_CHECK_IN: 'Work from home check-in recorded.',
  WFH_CHECK_OUT: 'Work from home check-out recorded.',
  LEAVE_REQUEST_SUBMITTED: 'Leave request submitted successfully.',
  LEAVE_REQUEST_APPROVED: 'Leave request approved.',
  LEAVE_REQUEST_REJECTED: 'Leave request rejected.',
  SYNC_COMPLETE: 'Data synchronized successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
} as const;

// ============================================================================
// ROLE CONSTANTS
// ============================================================================

export const ROLE_TYPES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  GUEST: 'guest',
} as const;

export type UserRole = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

// ============================================================================
// ATTENDANCE CONSTANTS
// ============================================================================

export const ATTENDANCE_CONSTANTS = {
  // Work status
  WORK_FROM_HOME: 'work_from_home',
  ON_SITE: 'on_site',

  // Attendance status
  STATUS_PRESENT: 'present',
  STATUS_ABSENT: 'absent',
  STATUS_LATE: 'late',
  STATUS_ON_LEAVE: 'on_leave',

  // Time format
  TIME_FORMAT_12H: 'hh:mm a',
  TIME_FORMAT_24H: 'HH:mm',
  DATE_FORMAT: 'yyyy-MM-dd',

  // Thresholds
  LATE_THRESHOLD_MINUTES: 15,
  MAX_CLOCK_IN_ADVANCE_MINUTES: 15,
} as const;

// ============================================================================
// LEAVE REQUEST CONSTANTS
// ============================================================================

export const LEAVE_REQUEST_TYPES = {
  LEAVE: 'leave',
  ABSENT: 'absent',
  DAY_OFF: 'day_off',
} as const;

export const LEAVE_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// ============================================================================
// MEETING CONSTANTS
// ============================================================================

export const MEETING_CONSTANTS = {
  // Meeting status
  STATUS_SCHEDULED: 'scheduled',
  STATUS_ONGOING: 'ongoing',
  STATUS_COMPLETED: 'completed',
  STATUS_CANCELLED: 'cancelled',

  // Attendance status
  ATTENDANCE_PRESENT: 'present',
  ATTENDANCE_ABSENT: 'absent',
  ATTENDANCE_LATE: 'late',
} as const;

// ============================================================================
// DATABASE & API CONSTANTS
// ============================================================================

export const API_CONSTANTS = {
  // Endpoints (relative paths)
  ENDPOINT_SYNC: '/api/offline/sync',
  ENDPOINT_VERIFY_EMAIL: '/api/verify-email',
  ENDPOINT_DIAGNOSTICS_ENV: '/api/diagnostics/env',
  ENDPOINT_DIAGNOSTICS_DB: '/api/diagnostics/db',

  // HTTP status codes (for reference)
  STATUS_OK: 200,
  STATUS_CREATED: 201,
  STATUS_BAD_REQUEST: 400,
  STATUS_UNAUTHORIZED: 401,
  STATUS_FORBIDDEN: 403,
  STATUS_NOT_FOUND: 404,
  STATUS_CONFLICT: 409,
  STATUS_INTERNAL_ERROR: 500,
} as const;

// ============================================================================
// SUPABASE/DATABASE CONSTANTS
// ============================================================================

export const DATABASE_TABLES = {
  PROFILES: 'profiles',
  ATTENDANCE: 'attendance',
  LEAVE_REQUESTS: 'leave_requests',
  MEETINGS: 'meetings',
  MEETING_ATTENDEES: 'meeting_attendees',
  MEETING_MINUTES: 'meeting_minutes',
} as const;

export const REALTIME_CHANNELS = {
  ATTENDANCE: 'attendance',
  LEAVE_REQUESTS: 'leave_requests',
  MEETINGS: 'meetings',
  MEETING_ATTENDEES: 'meeting_attendees',
  MEETING_MINUTES: 'meeting_minutes',
  STAFF_UPDATES: 'staff_updates',
} as const;

// ============================================================================
// BROWSER STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Session
  SESSION_ID: 'session_id',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',

  // Offline
  OFFLINE_DB_VERSION: 'offline_db_version',
  SYNC_LAST_TIMESTAMP: 'sync_last_timestamp',
  OFFLINE_QUEUE: 'offline_queue',

  // UI preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',

  // Cache
  CACHED_PROFILES: 'cached_profiles',
  CACHED_ATTENDANCE: 'cached_attendance',
} as const;

// ============================================================================
// FEATURE FLAGS & FEATURE CONFIGURATIONS
// ============================================================================

export const FEATURE_FLAGS = {
  OFFLINE_MODE_ENABLED: true,
  REALTIME_UPDATES_ENABLED: true,
  MEETING_MINUTES_ENABLED: true,
  WORK_FROM_HOME_ENABLED: true,
  AUTO_SYNC_ENABLED: true,
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRES_UPPERCASE: true,
  PASSWORD_REQUIRES_NUMBERS: true,
  PASSWORD_REQUIRES_SPECIAL: false,

  // Email
  EMAIL_MAX_LENGTH: 254,

  // Name fields
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,

  // Notes/Reason fields
  REASON_MAX_LENGTH: 500,
  ADMIN_NOTES_MAX_LENGTH: 500,

  // Regex patterns
  PATTERN_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PATTERN_PHONE: /^\d{10,}$/,
} as const;

// ============================================================================
// EXTERNAL SERVICE CONSTANTS
// ============================================================================

export const EXTERNAL_SERVICES = {
  // Email service
  EMAIL_FROM_ADDRESS: process.env.NEXT_PUBLIC_APP_EMAIL || 'noreply@attendance-system.local',
  EMAIL_FROM_NAME: 'Attendance System',

  // Application URL
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  KIOSK_URL: process.env.NEXT_PUBLIC_KIOSK_URL || 'http://localhost:3001',
} as const;

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

export const LOGGING = {
  // Log levels
  LEVEL_DEBUG: 'debug',
  LEVEL_INFO: 'info',
  LEVEL_WARN: 'warn',
  LEVEL_ERROR: 'error',

  // Default log level
  DEFAULT_LEVEL: 'info',

  // Max logs to keep in memory
  MAX_LOGS_IN_MEMORY: 1000,
} as const;

// ============================================================================
// EXPORT ALL CONSTANTS AS NAMESPACE
// ============================================================================

export const CONFIG = {
  TIME: TIME_CONSTANTS,
  UI: UI_THRESHOLDS,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  ROLES: ROLE_TYPES,
  ATTENDANCE: ATTENDANCE_CONSTANTS,
  LEAVE: {
    TYPES: LEAVE_REQUEST_TYPES,
    STATUS: LEAVE_REQUEST_STATUS,
  },
  MEETINGS: MEETING_CONSTANTS,
  API: API_CONSTANTS,
  DATABASE: {
    TABLES: DATABASE_TABLES,
    CHANNELS: REALTIME_CHANNELS,
  },
  STORAGE: STORAGE_KEYS,
  FEATURES: FEATURE_FLAGS,
  VALIDATION,
  SERVICES: EXTERNAL_SERVICES,
  LOGGING,
} as const;

// ============================================================================
// UTILITY FUNCTIONS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Get the appropriate time format based on locale
 */
export function getTimeFormat(locale?: string): string {
  return locale?.includes('en-US') ? TIME_CONSTANTS.TIME_FORMAT_12H : TIME_CONSTANTS.TIME_FORMAT_24H;
}

/**
 * Convert minutes to milliseconds
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Convert seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Check if user role has admin privileges
 */
export function isAdmin(role?: UserRole | null): boolean {
  return role === ROLE_TYPES.ADMIN;
}

/**
 * Check if user role is staff
 */
export function isStaff(role?: UserRole | null): boolean {
  return role === ROLE_TYPES.STAFF;
}
