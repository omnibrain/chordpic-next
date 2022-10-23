import { GetStaticPropsResult } from "next";
import Pricing from "../components/Pricing";
import { Product } from "../types";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

interface Props {
  products: Product[];
  title: string;
  description: string;
}

export default function PricingPage({ products }: Props) {
  return <Pricing products={products} />;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const products = await getActiveProductsWithPrices();

  return {
    props: {
      products,
      title: "Pricing Plans",
      description:
        "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
    },
    revalidate: 60,
  };
}
