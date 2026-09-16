import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/news", {
    title: "News",
    description:
      "News about ChordPic, the free guitar chord diagram creator. Learn about new features and updates.",
  });
}

export default function Page() {
  return <PageContent />;
}
