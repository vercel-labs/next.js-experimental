export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    title: 'node streamed title',
    description: 'node streamed description',
    openGraph: { title: 'node og title' },
  }
}

export default function Page() {
  return <p>node page</p>
}
