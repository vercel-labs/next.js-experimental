export async function getData(slug: string) {
  'use cache'
  await new Promise((r) => setTimeout(r, 1500))
  return `data for ${slug} @ ${Date.now()}`
}
