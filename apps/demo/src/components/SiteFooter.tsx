import { LOCALE } from "@/lib/config";
import { formatDateTime } from "@/lib/format";

/**
 * The footer is the demo's whole argument in four lines: it states when the content was
 * last fetched, and that timestamp does not move until someone rebuilds. A site that
 * fetched at request time could not honestly print it.
 *
 * <p>`API_URL` is deliberately not among the values shown — the demo's API origin is
 * infrastructure, not content, and printing it into public HTML invites traffic at it.
 */
export function SiteFooter({ postCount }: { postCount: number }) {
    const builtAt = new Date().toISOString();

    return (
        <footer className="mt-20 border-t border-rule">
            <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-muted">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr]">
                    <dt className="font-medium text-foreground">Built</dt>
                    <dd>
                        <time dateTime={builtAt}>{formatDateTime(builtAt)}</time>
                    </dd>

                    <dt className="font-medium text-foreground">Baked in</dt>
                    <dd>
                        {postCount} published {postCount === 1 ? "post" : "posts"}, locale{" "}
                        <code className="font-mono text-xs">{LOCALE}</code>
                    </dd>

                    <dt className="font-medium text-foreground">Requests since</dt>
                    <dd>None. This page is a file.</dd>
                </dl>

                <p className="mt-6 text-xs">
                    Static export of content served by{" "}
                    <span className="font-medium text-foreground">colophon</span>, a headless CMS.
                    All content here is synthetic.
                </p>
            </div>
        </footer>
    );
}
