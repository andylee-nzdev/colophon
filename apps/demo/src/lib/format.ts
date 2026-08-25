import { LOCALE } from "./config";

/**
 * Pinned to UTC on purpose. These dates are rendered once, on whatever machine runs the
 * build, and then frozen into HTML — formatting in the build machine's zone would make
 * the output depend on where it was built.
 */
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
});

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
});

export function formatDate(instant: string | null): string {
    return instant ? dateFormat.format(new Date(instant)) : "Unpublished";
}

export function formatDateTime(instant: string): string {
    return `${dateTimeFormat.format(new Date(instant))} UTC`;
}

/** `<time datetime="...">` wants a machine-readable date, not the formatted one. */
export function toDateAttribute(instant: string): string {
    return instant.slice(0, 10);
}
