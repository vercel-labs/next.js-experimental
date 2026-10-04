import ClientUrl from '../../client-url'

export async function generateStaticParams() {
  return [{ slug: 'a' }, { slug: 'b' }]
}

export default async function Page({ params }) {
  const { slug } = await params
  return (
    <main>
      <h1>blog {slug}</h1>
      <ClientUrl />
    </main>
  )
}
