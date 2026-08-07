import type { RaRecord } from "react-admin";

/** Mirrors `PostResponse` in the API. */
export interface Post extends RaRecord {
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

/**
 * Mirrors `PostRequest`. Deliberately narrower than {@link Post}: everything else is
 * server-owned, and `published` is only honoured on create — afterwards publication
 * state moves through the publish/unpublish endpoints.
 */
export interface PostRequest {
    slug: string;
    locale?: string;
    title: string;
    excerpt?: string | null;
    body: string;
    published?: boolean;
}

export const LOCALES = [
    { id: "en", name: "English" },
    { id: "zh-Hant", name: "繁體中文" },
    { id: "zh-Hans", name: "简体中文" },
    { id: "ja", name: "日本語" },
];
