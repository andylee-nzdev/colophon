import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a post body, which the admin authors as Markdown.
 *
 * <p>Rendered in a server component, so the parser runs during `next build` and no part
 * of it reaches the browser. What ships is the HTML it produced — Next's own runtime is
 * still in the page, but the Markdown machinery is not.
 *
 * <p>Raw HTML embedded in a post is passed through as text rather than parsed: this is a
 * public demo of a CMS whose write endpoints are not yet authenticated, so post bodies
 * are not a trustworthy source of markup. Enabling `rehype-raw` here later would need an
 * HTML sanitiser alongside it.
 */
export function Markdown({ children }: { children: string }) {
    return (
        <div className="prose prose-colophon max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:underline-offset-2 prose-pre:border prose-pre:border-rule prose-pre:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
        </div>
    );
}
