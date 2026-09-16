import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/about", {
    title: "About",
    description:
      "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
  });
}

export default function Page() {
  return <PageContent />;
}
