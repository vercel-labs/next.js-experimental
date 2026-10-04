import ClientUrl from '../../client-url'

export default async function Page({ params }) {
  const { id } = await params
  return (
    <main>
      <h1>shop {id}</h1>
      <ClientUrl />
    </main>
  )
}
