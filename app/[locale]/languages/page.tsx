import { pageMetadata } from "../../../services/page-meta";
import { serverT, T as TranslateTo } from "../../../utils/server-translate";
import type { Language } from "@magic-translate/core";
import { languageMap } from "../../../utils/translate";
import Link from "next/link";
import { localePath } from "../../../services/seo";
import { SUPPORT_EMAIL } from "../../../global";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Languages",
  description: "Chose your preferred ChordPic language",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/languages", META);
}

export default async function Languages({ params }: PageProps) {
  const { locale } = await params;
  const T = serverT(locale);

  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-heading prose-a:underline-offset-4">
      <h1>
        <T>Languages</T>
      </h1>
      <p>
        <T>ChordPic is currently available in the following languages:</T>
      </p>

      <ul className="grid list-none grid-cols-1 gap-3 ps-0 sm:grid-cols-3 sm:gap-4">
        {Object.entries(languageMap).map(([lang, { name }]) => (
          <li key={lang} className="ps-0">
            {/* `<Link locale>` was Pages Router only; the prefix is explicit now. */}
            <Link href={localePath(lang, "/")} className="underline">
              <TranslateTo lang={lang as Language}>{name}</TranslateTo>
            </Link>
          </li>
        ))}
      </ul>

      <p>
        <T>
          Missing a language? Thanks to{" "}
          <a
            href="https://magictranslate.io"
            style={{ textDecoration: "underline" }}
          >
            Magic Translate
          </a>{" "}
          we can instantly translate ChordPic to any other language. Just{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>{" "}
          and let us know which language to add.
        </T>
      </p>
    </article>
  );
}
