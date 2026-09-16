import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import PageContent from "./page-content";
import { loadProducts } from "@/services/products";

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/pricing", {
    title: "Pricing Plans",
    description:
      "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
  });
}

export const revalidate = 60;

export default async function PricingPage({ params }: LocalizedPageProps) {
  const { locale } = await params;
  const products = await loadProducts();
  return <PageContent products={products} locale={locale} />;
}
