export function generateStaticParams() {
  return [{ slug: 'привет' }, { slug: 'hello' }]
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <p id="dynamic">блог: {slug}</p>
}
