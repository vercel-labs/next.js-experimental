import { notFound } from 'next/navigation';

const DATA = { 'site-a': { home: 'Hello from site-a' } };

export async function generateStaticParams() {
  return [{ root: 'site-a', slug: [] }, { root: 'site-b', slug: [] }];
}

export default async function Page({ params }) {
  const { root, slug } = await params;
  const key = slug?.join('/') || 'home';
  const data = DATA[root]?.[key];
  if (!data) notFound();
  return <div id="content">{data}</div>;
}
