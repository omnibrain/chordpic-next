import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Pricing from "../components/Pricing";
import { Product } from "../types";
import { localizedMeta, PageMetaProps } from "../services/page-meta";
import {
  loadProducts,
  PRICING_DEGRADED_REVALIDATE_SECONDS,
  PRICING_REVALIDATE_SECONDS,
} from "../services/products";

interface Props extends PageMetaProps {
  products: Product[];
}

export default function PricingPage({ products }: Props) {
  return <Pricing products={products} />;
}

export async function getStaticProps({
  locale,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const { products, degraded } = await loadProducts();

  return {
    props: {
      products,
      ...(await localizedMeta(locale, {
        title: "Pricing Plans",
        description:
          "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
      })),
    },
    revalidate: degraded
      ? PRICING_DEGRADED_REVALIDATE_SECONDS
      : PRICING_REVALIDATE_SECONDS,
  };
}
