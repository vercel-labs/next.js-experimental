import Link from 'next/link'

const slugs = Array.from({ length: 15 }, (_, i) => `item-${i + 1}`)

export function generateStaticParams() {
  return [
    { locale: 'en' },
    ...slugs.map((slug) => ({ locale: 'en', slug: [slug] })),
  ]
}

export default async function Page({ params }) {
  const { locale, slug } = await params
  return (
    <main>
      <h1>{slug?.join('/') ?? 'listing'}</h1>
      <p id="route">/{locale}/{slug?.join('/') ?? ''}</p>
      <nav>
        <Link href={`/${locale}`} style={{ display: 'block' }}>index</Link>
        {slugs.map((item) => (
          <Link key={item} href={`/${locale}/${item}`} style={{ display: 'block' }}>
            {item}
          </Link>
        ))}
      </nav>
    </main>
  )
}
