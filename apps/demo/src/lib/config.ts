/**
 * Build-time configuration. Every value here is read while `next build` runs and then
 * baked into HTML; none of it reaches the browser, which is why nothing is prefixed
 * `NEXT_PUBLIC_`.
 */

/** Origin of the colophon API. Trailing slashes are trimmed so path joins stay clean. */
export const API_URL = (process.env.COLOPHON_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

/**
 * The API filters one locale per query and has no "any locale" mode, so a build produces
 * a site in exactly one language. A multilingual site is several builds, or one build
 * with a locale segment in the route — deliberately out of scope for the demo.
 */
export const LOCALE = process.env.COLOPHON_LOCALE ?? "en";

/**
 * Matches `spring.data.web.pageable.max-page-size`. Asking for the largest page the API
 * allows keeps a normal content set to a single round trip.
 */
export const PAGE_SIZE = 200;
