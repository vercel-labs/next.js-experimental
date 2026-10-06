import { getThing } from "../data";

// Case B: prerendered at build time, regenerated at runtime after `revalidate`.
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getThing(`home-${locale}`);
  return <pre>{`at=${t.at}`}</pre>;
}
