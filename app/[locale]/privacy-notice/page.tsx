import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/privacy-notice", {
    title: "Privacy Notice",
  });
}

export default function Page() {
  return <PageContent />;
}
