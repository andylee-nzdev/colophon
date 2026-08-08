import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /*
     * The whole point of this app: `next build` emits a directory of HTML into `out/`
     * and nothing else. There is no Node server in the read path, so the API can be
     * asleep — or gone — without the published site noticing.
     */
    output: "export",

    // `next/image`'s optimiser is a server, which a static export does not have.
    images: { unoptimized: true },

    /*
     * Writes `out/posts/<slug>/index.html` rather than `out/posts/<slug>.html`, which is
     * what a plain file server (S3, nginx, GitHub Pages) resolves without rewrite rules.
     */
    trailingSlash: true,
};

export default nextConfig;
