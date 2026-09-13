import { LocaleLink as Link } from "./LocaleLink";
import { FacebookIcon, RedditIcon } from "react-share";
import { serverT } from "../utils/server-translate";

const footerLink =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

/**
 * A server component: it has no state of its own, so its three links can be
 * translated during the render instead of after hydration. It reaches the page
 * as a prop on SiteChrome, which is a client component and could not render it
 * as a child.
 */
export const Footer = ({ locale }: { locale: string }) => {
  const T = serverT(locale);

  return (
    <footer className="border-t py-8">
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
};
