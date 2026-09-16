import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/signup", {
    title: "Sign up",
    description:
      "Sign up for ChordPic to create beautiful guitar chord charts.",
  });
}

export default function Page() {
  return <PageContent />;
}
