import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { getPost, getPosts } from "@/lib/api";
import { formatDate, toDateAttribute } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

/**
 * The route manifest. With `output: "export"` this is not an optimisation — it is the
 * only way these pages come to exist, since there is no server to render a slug that was
 * not listed here.
 */
export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {};
    }

    return {
        title: post.title,
        description: post.excerpt ?? undefined,
    };
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);

    /*
     * Unreachable in a normal build — `generateStaticParams` only ever emits slugs that
     * exist. It is here because the type says the lookup can miss, and because `next dev`
     * will happily be asked for a slug that was deleted since the last fetch.
     */
    if (!post) {
        notFound();
    }

    return (
        <article className="mx-auto max-w-3xl px-6 py-14">
            <header className="border-b border-rule pb-8">
                <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
                    {post.title}
                </h1>

                {post.publishedAt && (
                    <p className="mt-3 text-sm text-muted">
                        <time dateTime={toDateAttribute(post.publishedAt)}>
                            {formatDate(post.publishedAt)}
                        </time>
                    </p>
                )}

                {post.excerpt && (
                    <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>
                )}
            </header>

            <div className="py-10">
                <Markdown>{post.body}</Markdown>
            </div>

            <footer className="border-t border-rule pt-8">
                <Link
                    href="/"
                    className="text-sm text-accent-adaptive hover:underline underline-offset-4"
                >
                    <span aria-hidden="true">&larr;</span> All posts
                </Link>
            </footer>
        </article>
    );
}
