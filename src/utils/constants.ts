// ── Date labels ──────────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

// ── Pagination ────────────────────────────────────────────────────────────────

/** Default number of transactions fetched per page */
export const TRANSACTIONS_PAGE_SIZE = 20;

// ── Dashboard thresholds ──────────────────────────────────────────────────────

/** Minimum expense amount (₹) before an uncategorised nudge is shown */
export const UNCATEGORISED_NUDGE_MIN_AMOUNT = 5000;

// ── Obligation look-ahead windows ─────────────────────────────────────────────

/** Days ahead used in Bills component obligation fetch */
export const BILLS_LOOKAHEAD_DAYS = 45;

/** Days ahead used in BillsCalendar obligation fetch */
export const CALENDAR_LOOKAHEAD_DAYS = 60;

/** Days ahead used in Dashboard obligation fetch */
export const DASHBOARD_LOOKAHEAD_DAYS = 45;

// ── Finance calculations ──────────────────────────────────────────────────────

/** Days in a year — used for annualising recurring pattern frequencies */
export const DAYS_IN_YEAR = 365;
