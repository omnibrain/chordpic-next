import { serverTranslate } from "@/services/server-translate";
import { languageMap } from "@/utils/translate";
import Link from "@/components/LocalizedLink";
import { SUPPORT_EMAIL } from "@/global";

const Languages = ({ locale }: { locale: string }) => {
  const { T } = serverTranslate(locale);
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-heading prose-a:underline-offset-4">
      <h1>
        <T>Languages</T>
      </h1>
      <p>
        <T>ChordPic is currently available in the following languages:</T>
      </p>

      <ul className="grid list-none grid-cols-1 gap-3 ps-0 sm:grid-cols-3 sm:gap-4">
        {Object.entries(languageMap).map(([lang, { name }]) => {
          const { T: LanguageName } = serverTranslate(lang);
          return (
            <li key={lang} className="ps-0">
              <Link href="/" locale={lang} className="underline">
                <LanguageName>{name}</LanguageName>
              </Link>
            </li>
          );
        })}
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
};

export default Languages;
