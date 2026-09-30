export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params
  return <div>{slug}</div>
}
