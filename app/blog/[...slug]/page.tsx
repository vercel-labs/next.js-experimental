import { getPost, ALL_SLUGS } from '../../../lib/data'

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug: [slug] }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const post = await getPost(slug.join('/'))
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  )
}
