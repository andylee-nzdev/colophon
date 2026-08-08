import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: "How this demo site is built, and why the published pages never call the API.",
};

/*
 * Hardcoded rather than fetched. It describes the machinery, not the content — and the
 * CMS has no `Page` entity yet, only `Post`.
 */
export default function AboutPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-14">
            <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
                About this demo
            </h1>

            <div className="mt-8 space-y-5 leading-relaxed text-foreground/85">
                <p>
                    This site consumes <span className="font-medium text-foreground">colophon</span>
                    , a headless CMS built with Spring Boot. It exists to prove one specific
                    property before a real site depends on it: that a published page can be made
                    of CMS content without being coupled to the CMS at runtime.
                </p>

                <h2 className="pt-4 font-serif text-xl tracking-tight text-foreground">
                    What happens at build time
                </h2>
                <ol className="list-decimal space-y-2 pl-5 marker:text-muted">
                    <li>
                        <code className="font-mono text-sm">next build</code> calls{" "}
                        <code className="font-mono text-sm">GET /api/v1/posts</code>, paging until
                        the API says it has sent the last one.
                    </li>
                    <li>
                        Those posts become the route manifest — one static route per slug, via{" "}
                        <code className="font-mono text-sm">generateStaticParams</code>.
                    </li>
                    <li>
                        Each page renders to HTML, Markdown bodies included, and lands in{" "}
                        <code className="font-mono text-sm">out/</code>.
                    </li>
                </ol>

                <h2 className="pt-4 font-serif text-xl tracking-tight text-foreground">
                    What happens at request time
                </h2>
                <p>
                    Nothing. A visitor is served a file. There is no Node process, no database
                    connection, and no API call — which is why the CMS can run on a free tier that
                    sleeps, and why an outage delays the next publish rather than taking the site
                    down.
                </p>

                <h2 className="pt-4 font-serif text-xl tracking-tight text-foreground">
                    The trade
                </h2>
                <p>
                    Content is only as fresh as the last build. Publishing has to trigger a
                    rebuild, which takes a minute or two — the cost of never being able to serve a
                    500. Drafts are invisible here by construction: the API returns published
                    content only unless asked otherwise, so an unpublished post has no page to
                    request.
                </p>

                <p className="border-t border-rule pt-5 text-sm text-muted">
                    Every post on this site is synthetic, written for the demo.
                </p>
            </div>
        </div>
    );
}
