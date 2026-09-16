"use client";

import Pricing from "@/components/Pricing";
import type { Product } from "@/types";

export default function PricingContent({ products }: { products: Product[] }) {
  return <Pricing products={products} />;
}
