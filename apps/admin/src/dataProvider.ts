import { HttpError } from "react-admin";
import type { DataProvider, Identifier } from "react-admin";
import type { Post, PostRequest } from "./posts/types";

const BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api/v1`;

/**
 * The API's contract and react-admin's disagree in four places, and this file is the
 * whole of the translation:
 *
 * <ul>
 *   <li>react-admin pages from 1, {@code Pageable} from 0, and the total lives in the
 *       {@code PageResponse} body rather than a header.</li>
 *   <li>Sorting is one {@code sort=field,dir} parameter, not two.</li>
 *   <li>Publication state is not a writable field — see {@link publish}.</li>
 *   <li>Errors are RFC 9457 problem details; field-level messages arrive as an
 *       {@code errors} array and have to become an object for the form to place them.</li>
 * </ul>
 */
async function request<T = any>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            // Bearer token goes here once auth lands.
            ...init?.headers,
        },
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new HttpError(
            body.detail ?? response.statusText,
            response.status,
            // `errors` keyed by field is what makes react-admin show the message on the
            // input that caused it rather than only in a notification.
            { ...body, errors: fieldErrors(body) },
        );
    }

    return body as T;
}

function fieldErrors(body: { errors?: { field: string; message: string }[] }) {
    return Object.fromEntries(
        (body.errors ?? []).map((error) => [error.field, error.message]),
    );
}

interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

/** Strips the server-owned fields; `published` is honoured on create only. */
function toRequest(data: Partial<Post> & { published?: boolean }, isCreate: boolean): PostRequest {
    return {
        slug: data.slug!,
        locale: data.locale,
        title: data.title!,
        excerpt: data.excerpt ?? null,
        body: data.body!,
        ...(isCreate ? { published: data.published ?? false } : {}),
    };
}

export interface ColophonDataProvider extends DataProvider {
    publish: (id: Identifier) => Promise<Post>;
    unpublish: (id: Identifier) => Promise<Post>;
}

export const dataProvider: ColophonDataProvider = {
    async getList(resource, params) {
        const { page = 1, perPage = 20 } = params.pagination ?? {};
        const { field = "publishedAt", order = "DESC" } = params.sort ?? {};
        const query = new URLSearchParams({
            page: String(page - 1),
            size: String(perPage),
            sort: `${field},${order.toLowerCase()}`,
        });

        // The API filters one locale at a time and has no "any locale" mode; the list
        // view always sends one. `published` omitted means published-only, so the
        // editor's draft/published toggle has to be explicit about both values.
        if (params.filter?.locale) query.set("locale", params.filter.locale);
        if (params.filter?.published !== undefined) {
            query.set("published", String(params.filter.published));
        }

        const body = await request<PageResponse<any>>(`/${resource}?${query}`);
        return { data: body.content, total: body.totalElements };
    },

    async getOne(resource, params) {
        return { data: await request(`/${resource}/${params.id}`) };
    },

    /** No bulk-by-ids endpoint yet, so this fans out. Harmless until relations exist. */
    async getMany(resource, params) {
        const data = await Promise.all(
            params.ids.map((id) => request(`/${resource}/${id}`)),
        );
        return { data };
    },

    async getManyReference() {
        // Nothing in the content model references anything else yet.
        return { data: [], total: 0 };
    },

    async create(resource, params) {
        const data = await request(`/${resource}`, {
            method: "POST",
            body: JSON.stringify(toRequest(params.data, true)),
        });
        return { data };
    },

    async update(resource, params) {
        const data = await request(`/${resource}/${params.id}`, {
            method: "PUT",
            body: JSON.stringify(toRequest(params.data, false)),
        });
        return { data };
    },

    async updateMany(resource, params) {
        await Promise.all(
            params.ids.map((id) =>
                request(`/${resource}/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(toRequest(params.data, false)),
                }),
            ),
        );
        return { data: params.ids };
    },

    async delete(resource, params) {
        await request(`/${resource}/${params.id}`, { method: "DELETE" });
        return { data: params.previousData! };
    },

    async deleteMany(resource, params) {
        await Promise.all(
            params.ids.map((id) => request(`/${resource}/${id}`, { method: "DELETE" })),
        );
        return { data: params.ids };
    },

    /**
     * Its own endpoint rather than a field on update, because publishing is the
     * transition the deploy webhook will hang off later.
     */
    publish: (id) => request<Post>(`/posts/${id}/publish`, { method: "POST" }),

    unpublish: (id) => request<Post>(`/posts/${id}/unpublish`, { method: "POST" }),
};
