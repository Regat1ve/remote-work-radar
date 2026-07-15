import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "remote-work-radar — remote jobs for devs Upwork won't accept",
  description:
    "OSS job aggregator for developers locked out of Upwork, Mercor, Deel, and Contra. Beginner-friendly. Bring your own Claude Code.",
  metadataBase: new URL("https://github.com/Regat1ve/remote-work-radar"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-ink-200 dark:border-ink-700">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-mono text-sm font-semibold">
              remote-work-radar
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/jobs" className="hover:text-accent-600">
                Jobs
              </Link>
              <Link href="/onboarding" className="hover:text-accent-600">
                First time?
              </Link>
              <Link href="/glossary" className="hover:text-accent-600">
                Glossary
              </Link>
              <Link href="/templates" className="hover:text-accent-600">
                Templates
              </Link>
              <a
                href="https://github.com/Regat1ve/remote-work-radar"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent-600"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="border-t border-ink-200 dark:border-ink-700 mt-16">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-400">
            MIT.{" "}
            <a
              href="https://github.com/Regat1ve/remote-work-radar"
              className="hover:text-accent-600"
            >
              Fork on GitHub
            </a>
            . Built by{" "}
            <a href="https://vitalyzelenov-portfolio.vercel.app" className="hover:text-accent-600">
              Vitaly Zelenov
            </a>{" "}
            because Upwork kicked out Russia in 2022.
          </div>
        </footer>
      </body>
    </html>
  );
}
