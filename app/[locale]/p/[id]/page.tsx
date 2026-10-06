import { Suspense } from "react";
import { getThing } from "../../../data";

// Case A: only "seed" is prerendered. Any other id gets the fallback shell first and is then
// upgraded to a complete static page in the background (partialPrefetching).
export async function generateStaticParams() {
  return [{ id: "seed" }];
}

async function Body({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getThing(id);
  return <pre>{`at=${t.at}`}</pre>;
}

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p>loading</p>}>
      <Body params={props.params} />
    </Suspense>
  );
}
