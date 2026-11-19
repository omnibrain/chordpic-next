import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";
import { requireUser } from "@/utils/server-user";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/my-chords", {
    title: "My chords",
    description: "The chord diagrams you saved to your ChordPic account.",
  });
}

export default async function MyChordsPage({ params }: LocalizedPageProps) {
  const { locale } = await params;
  await requireUser(locale, "/my-chords");
  return <PageContent />;
}
