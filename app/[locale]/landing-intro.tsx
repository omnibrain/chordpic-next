import NextLink from "@/components/LocalizedLink";
import { serverTranslate } from "@/services/server-translate";

/**
 * The headline and lead of the landing page.
 *
 * Kept out of the client editor so it arrives translated in the HTML: rendered
 * on the client it starts as English and re-wraps once the translation lands,
 * which moves the whole editor down the page.
 */
export const LandingIntro = ({ locale }: { locale: string }) => {
  const { T } = serverTranslate(locale);

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
    </>
  );
};

export default LandingIntro;
