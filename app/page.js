export default async function Page() {
  const items = ['a', 'b', 'c']
  return <main>home: {items.join(',')}</main>
}
