import { Clock } from '../../../components/clock'

export async function generateStaticParams() {
  return [{ slug: 'hello' }]
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main>
      <h1>{slug}</h1>
      <Clock />
    </main>
  )
}
