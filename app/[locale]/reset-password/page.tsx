import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/reset-password");
}

export default function Page() {
  return <PageContent />;
}
