import Link from "next/link";
import { FacebookIcon, RedditIcon } from "react-share";
import { T } from "@magic-translate/react";

const footerLink =
  "text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export const Footer = () => (
  <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
    <div className="mx-auto flex w-full max-w-content flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center">
      <a
        href="https://reddit.com/r/chordpic"
        className={`flex items-center gap-2 ${footerLink}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <RedditIcon borderRadius={100} size="1.5em" /> Reddit
      </a>
      <a
        href="https://www.facebook.com/chordpic"
        className={`flex items-center gap-2 ${footerLink}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <FacebookIcon borderRadius={100} size="1.5em" /> Facebook
      </a>
      <div className="flex-1" />
      <Link href="/about" className={footerLink}>
        <T>About</T>
      </Link>
      <Link href="/terms" className={footerLink}>
        <T>Terms of Use</T>
      </Link>
      <Link href="/privacy-notice" className={footerLink}>
        <T>Privacy</T>
      </Link>
    </div>
  </footer>
);
