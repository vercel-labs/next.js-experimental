export function generateStaticParams() {
  return [{ slug: 'привет' }]
}

export default async function Page({ params }) {
  const { slug } = await params
  return <p id="dynamic">блог: {slug}</p>
}
