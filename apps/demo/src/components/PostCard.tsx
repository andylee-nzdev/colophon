import Link from "next/link";
import { formatDate, toDateAttribute } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
    return (
        <article className="group border-b border-rule py-7 last:border-b-0">
            <h2 className="font-serif text-xl leading-snug tracking-tight">
                <Link href={`/posts/${post.slug}`} className="hover:text-accent-adaptive">
                    {post.title}
                </Link>
            </h2>

            {post.publishedAt && (
                <p className="mt-1.5 text-sm text-muted">
                    <time dateTime={toDateAttribute(post.publishedAt)}>
                        {formatDate(post.publishedAt)}
                    </time>
                </p>
            )}

            {post.excerpt && <p className="mt-3 leading-relaxed text-foreground/85">{post.excerpt}</p>}

            <p className="mt-3">
                <Link
                    href={`/posts/${post.slug}`}
                    className="text-sm text-accent-adaptive hover:underline underline-offset-4"
                >
                    Read more <span aria-hidden="true">&rarr;</span>
                </Link>
            </p>
        </article>
    );
}
