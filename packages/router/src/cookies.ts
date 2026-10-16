export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Not httpOnly: client-side code must be able to read and clear it to offer
 * a "switch market" control.
 */
export const BYPASS_COOKIE = "X-BYPASS-GEOLOCATION";

export const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const REDIRECT_STATUS = 307 as const;
