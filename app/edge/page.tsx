export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    title: 'edge streamed title',
    description: 'edge streamed description',
    openGraph: { title: 'edge og title' },
  }
}

export default function Page() {
  return <p>edge page</p>
}
