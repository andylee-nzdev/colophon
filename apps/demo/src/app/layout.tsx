import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPosts } from "@/lib/api";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "colophon demo",
        template: "%s — colophon demo",
    },
    description:
        "A statically exported Next.js site whose content is fetched from the colophon headless CMS at build time.",
};

/**
 * The layout fetches too, so the footer can report how much content this build contains.
 * That costs nothing: `getPosts` is memoised, so this shares the index page's fetch
 * rather than adding one.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const posts = await getPosts();

    return (
        <html lang={posts[0]?.locale ?? "en"}>
            <body className="flex min-h-screen flex-col font-sans">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter postCount={posts.length} />
            </body>
        </html>
    );
}
