export const ALL_SLUGS = Array.from({ length: 12 }, (_, i) => `post-${i + 1}`)

export async function getPost(slug: string) {
  'use cache'
  return { title: `Post ${slug}`, body: `Body of ${slug}` }
}
