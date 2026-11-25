import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND, formatINR, getProductBySlug, PRODUCTS } from "@/content/site";
import { ProductConfigurator } from "@/components/ProductConfigurator";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: `Not Found | ${BRAND.name}` };
  }
  return {
    title: `${product.name} (${formatINR(product.price)}) | ${BRAND.name}`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return <ProductConfigurator initialProduct={product} />;
}
