import Pricing from "../../../components/Pricing";
import { pageMetadata } from "../../../services/page-meta";
import { loadProducts } from "../../../services/products";

type PageProps = { params: Promise<{ locale: string }> };

const META = {
  title: "Pricing Plans",
  description:
    "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
};

/** Was `revalidate: 60` on getStaticProps. */
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return pageMetadata(locale, "/pricing", META);
}

export default async function PricingPage() {
  const products = await loadProducts();

  return <Pricing products={products} />;
}
