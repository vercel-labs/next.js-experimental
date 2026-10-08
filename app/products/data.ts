import { query } from 'fake-db'

// Uncached database read inside the static subtree.
export async function getProducts() {
  return query('select * from products')
}
