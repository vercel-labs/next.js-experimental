import { getProducts } from './data'

export default async function Products() {
  const rows = await getProducts()
  return (
    <ul>
      {rows.map((row: any) => (
        <li key={row.sql}>{row.fetchedAt}</li>
      ))}
    </ul>
  )
}
