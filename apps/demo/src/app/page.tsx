import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/lib/api";

export default async function HomePage() {
    const posts = await getPosts();

    return (
        <div className="mx-auto max-w-3xl px-6">
            <section className="border-b border-rule py-14">
                <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                    Content from an API
                    <br />
                    that nobody has to call.
                </h1>
                <p className="mt-6 max-w-xl leading-relaxed text-muted">
                    Every post below was fetched from{" "}
                    <span className="text-foreground">colophon</span>, a headless CMS, while this
                    site was being built — then written to disk as HTML. Reading this page touches
                    no API and no database. The CMS could be switched off right now and nothing
                    here would change until someone published again.
                </p>
            </section>

            {posts.length > 0 ? (
                <section className="py-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </section>
            ) : (
                /*
                 * Reached when the API answered but has nothing published in this locale — a
                 * different situation from the API being down, which fails the build outright.
                 */
                <section className="py-14">
                    <h2 className="font-serif text-xl">Nothing published yet</h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-muted">
                        The API responded, but it holds no published posts in this locale. Run{" "}
                        <code className="font-mono text-sm text-foreground">npm run seed</code> to
                        load the synthetic demo content, then build again.
                    </p>
                </section>
            )}
        </div>
    );
}
