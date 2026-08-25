import { cache } from "react";
import { API_URL, LOCALE, PAGE_SIZE } from "./config";
import type { PageResponse, Post } from "./types";

/**
 * The build-time content layer, and the reference implementation of the pattern
 * `yd-temple` will copy.
 *
 * <p>Three properties matter here, and they are why this file exists rather than a
 * `fetch` call inlined in each page:
 *
 * <ul>
 *   <li><b>It runs at build time only.</b> Every caller is a server component rendered
 *       by `next build`. Nothing in this file ships to the browser, and the published
 *       site makes no request to the API ever again.</li>
 *   <li><b>One fetch feeds the whole site.</b> `getPosts` is memoised, so the index, the
 *       route manifest and all N post pages share a single pass over the API rather than
 *       issuing 1 + N requests.</li>
 *   <li><b>A broken API fails the build loudly.</b> The alternative — degrading to an
 *       empty site — would quietly publish a homepage with no content on it.</li>
 * </ul>
 */

async function fetchPage(page: number): Promise<PageResponse<Post>> {
    const query = new URLSearchParams({
        locale: LOCALE,
        page: String(page),
        size: String(PAGE_SIZE),
        sort: "publishedAt,desc",
    });
    const url = `${API_URL}/api/v1/posts?${query}`;

    let response: Response;
    try {
        /*
         * No `cache` option, deliberately. `force-cache` looks right here — it would let
         * Next's fetch cache dedupe across the worker processes it forks to render pages
         * in parallel — but that cache lives in `.next/cache` and *survives between
         * builds*, so a rebuild after publishing re-emits the previous build's content.
         * That breaks the one thing this architecture has to get right.
         *
         * Uncached, each worker fetches once (React's `cache` dedupes within a process),
         * so the cost is a handful of requests per build rather than one. Worth it.
         */
        response = await fetch(url);
    } catch (cause) {
        throw new Error(
            `Could not reach the colophon API at ${API_URL}. A static export needs it up at ` +
                `build time (the published site does not). Start it with \`./mvnw spring-boot:run\` ` +
                `in apps/api, or point COLOPHON_API_URL somewhere else.`,
            { cause },
        );
    }

    if (!response.ok) {
        throw new Error(
            `GET ${url} returned ${response.status} ${response.statusText}. ` +
                `Expected a page of published posts.`,
        );
    }

    return response.json();
}

/**
 * Every published post in the configured locale, newest first.
 *
 * <p>Paginates to exhaustion rather than assuming one page is enough — `PAGE_SIZE` is a
 * ceiling the API enforces, not a promise about how much content exists.
 */
export const getPosts = cache(async (): Promise<Post[]> => {
    const posts: Post[] = [];

    for (let page = 0; ; page++) {
        const body = await fetchPage(page);
        posts.push(...body.content);
        if (body.last) {
            break;
        }
    }

    return posts;
});

/**
 * Resolved from the list rather than from `GET /posts/by-slug/{slug}`, which exists for
 * one-off lookups. The list endpoint returns full bodies precisely so a build does not
 * have to make a request per post; using it here is what makes that design pay off.
 */
export const getPost = cache(async (slug: string): Promise<Post | undefined> => {
    const posts = await getPosts();
    return posts.find((post) => post.slug === slug);
});
