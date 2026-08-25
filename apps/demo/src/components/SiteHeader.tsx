import Link from "next/link";

export function SiteHeader() {
    return (
        <header className="border-b border-rule">
            <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4 px-6 py-5">
                <Link href="/" className="group flex items-baseline gap-2.5">
                    <span className="font-serif text-xl tracking-tight group-hover:text-accent-adaptive">
                        colophon
                    </span>
                    <span className="hidden text-xs text-muted sm:inline">demo</span>
                </Link>

                <nav className="flex items-center gap-5 text-sm text-muted">
                    <Link href="/" className="hover:text-foreground">
                        Posts
                    </Link>
                    <Link href="/about" className="hover:text-foreground">
                        About
                    </Link>
                </nav>
            </div>
        </header>
    );
}
