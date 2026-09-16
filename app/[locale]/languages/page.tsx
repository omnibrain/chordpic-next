import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/languages", {
    title: "Languages",
    description: "Chose your preferred ChordPic language",
  });
}

export default async function Page({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return <PageContent locale={locale} />;
}
