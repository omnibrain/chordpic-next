import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";
import { requireUser } from "@/utils/server-user";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/account");
}

export default async function AccountPage({ params }: LocalizedPageProps) {
  const { locale } = await params;
  const user = await requireUser(locale);
  return <PageContent user={user} />;
}
