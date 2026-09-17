import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import LandingIntro from "./landing-intro";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/", {
    title: "Free guitar chord diagram creator",
    description: "It has never been easier to create beautiful chord diagrams.",
  });
}

export default async function Page({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return (
    <>
      <LandingIntro locale={locale} />
      <PageContent />
    </>
  );
}
