import NextLink from "next/link";
import { pageMetadata } from "../../../services/page-meta";
import { serverT } from "../../../utils/server-translate";

const META = {
  title: "About",
  description:
    "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
};

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/about", META);
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const T = serverT(locale);

  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-heading prose-a:underline-offset-4">
      <h1>
        <T>About</T>
      </h1>
      <p>
        <T>ChordPic is a completely free tool to create guitar chord charts.</T>
      </p>
      <p>
        <T>
          While many tools exist to create guitar chord charts, ChordPic is by
          far the fastest and easiest solution.
        </T>
      </p>
      <h2 id="feature-requests-or-bug-reports">
        <T>Feature Requests or Bug Reports</T>
      </h2>
      <p>
        <T>
          If you&apos;re missing an essential feature or found a bug,{" "}
          <a
            href="https://gitlab.com/Voellmy/chordpic/issues"
            style={{ textDecoration: "underline" }}
          >
            please create a ticket on GitLab
          </a>{" "}
          or{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          .
        </T>
      </p>
      <h2 id="privacy-notice">
        <T>Privacy Notice</T>
      </h2>
      <p>
        <NextLink href="/privacy-notice">
          <T>Read ChordPic&apos;s privacy notice here.</T>
        </NextLink>
      </p>
      <h2 id="cookie-policy">
        <T>Cookie Policy</T>
      </h2>
      <p>
        {/* this is not a next link on purpose: The cookiefirst stuff will not load when routed with next */}
        <a href="/cookie-policy">
          <T>
            Read ChordPic&apos;s cookie policy or adjust your settings here.
          </T>
        </a>
      </p>
    </article>
  );
}
