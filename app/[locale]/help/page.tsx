import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/help", {
    title: "Help",
    description:
      "Learn how to create guitar chord diagrams with ChordPic. Don't worry, it's super easy!",
  });
}

export default function Page() {
  return <PageContent />;
}
