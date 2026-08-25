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

    /*
     * `next dev` otherwise writes an AGENTS.md and a CLAUDE.md into this directory on
     * every run — uncommitted churn, and a second CLAUDE.md competing with the
     * hand-written one at the repo root. Its actual advice (Boot-4-style: this Next is
     * newer than most training data, real docs are in node_modules/next/dist/docs) is
     * recorded there instead.
     */
    agentRules: false,
};

export default nextConfig;
