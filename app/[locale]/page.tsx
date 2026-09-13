import { LocaleLink as NextLink } from "../../components/LocaleLink";
import { HomeEditor } from "../../components/HomeEditor";
import { pageMetadata } from "../../services/page-meta";
import { serverT, serverTranslator } from "../../utils/server-translate";

type PageProps = { params: Promise<{ locale: string }> };

// The home page had no getStaticProps at all, so it fell through to Layout's
// English defaults — on every locale, including the /es and /pt pages that
// between them take a third of our organic traffic.
const META = {
  title: "Free guitar chord diagram creator",
  description: "It has never been easier to create beautiful chord diagrams.",
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/", META);
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const T = serverT(locale);
  const t = serverTranslator(locale);

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        <T>Guitar Chord Diagram Creator</T>
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        <T>
          It&apos;s never been easier to create guitar chord diagrams! Start by
          clicking anywhere on the{" "}
          <a className="underline" href="#editor">
            editor
          </a>{" "}
          fret board and immediately see the result on the{" "}
          <a className="underline" href="#result">
            result
          </a>{" "}
          fret board. Then{" "}
          <a className="underline" href="#download">
            download
          </a>{" "}
          and{" "}
          <a className="underline" href="#share">
            share
          </a>{" "}
          your chord diagram.
        </T>
      </p>
      <p className="mt-2">
        <NextLink
          href="/pricing"
          className="font-medium underline underline-offset-4"
        >
          <span className="[.ads-off_&]:hidden">
            <T>Get the Pro version (no ads, no watermark)</T>
          </span>
          <span className="hidden [.ads-off_&]:inline">
            <T>Get the Pro version (no watermark)</T>
          </span>
        </NextLink>
      </p>
      <HomeEditor
        editorLabel={await t("Editor")}
        resultLabel={await t("Result")}
        rotateLabel={await t("Rotate chord diagram")}
      />
    </>
  );
}
