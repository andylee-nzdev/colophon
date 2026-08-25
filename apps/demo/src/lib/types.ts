/** Mirrors `PostResponse` in the API. */
export interface Post {
    id: string;
    slug: string;
    locale: string;
    title: string;
    excerpt: string | null;
    body: string;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    version: number;
}

/** Mirrors `PageResponse<T>` — the API's paged envelope. */
export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
