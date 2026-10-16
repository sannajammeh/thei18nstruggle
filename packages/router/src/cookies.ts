/** Cookie that stores the visitor's chosen/preferred locale. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Cookie that lets a visitor opt out of geolocation (e.g. someone on vacation
 * who still wants to order to their home address). Not httpOnly — client JS
 * must be able to read and clear it to offer a "switch market" control.
 * When present, `geolocate()` returns null and routing falls back to the
 * locale cookie / negotiation.
 */
export const BYPASS_COOKIE = "X-BYPASS-GEOLOCATION";

/** The bypass cookie lives for 7 days. */
export const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** How long the locale preference cookie persists. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Crawlers are never redirected, humans are — with a temporary status so the root stays canonical. */
export const REDIRECT_STATUS = 307 as const;
