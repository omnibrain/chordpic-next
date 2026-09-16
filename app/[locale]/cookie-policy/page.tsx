import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/cookie-policy", {
    title: "Cookie policy",
  });
}

export default function Page() {
  return <PageContent />;
}
