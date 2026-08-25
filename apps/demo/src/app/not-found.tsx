import Link from "next/link";

/** Exported as `out/404.html`; most static hosts serve it for unmatched paths. */
export default function NotFound() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-24">
            <h1 className="font-serif text-3xl tracking-tight">Not found</h1>
            <p className="mt-4 max-w-lg leading-relaxed text-muted">
                There is no page at this address. Since the site is a static export, that means no
                published post had this slug when it was last built.
            </p>
            <p className="mt-6">
                <Link
                    href="/"
                    className="text-sm text-accent-adaptive hover:underline underline-offset-4"
                >
                    <span aria-hidden="true">&larr;</span> All posts
                </Link>
            </p>
        </div>
    );
}
