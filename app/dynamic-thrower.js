import { connection } from 'next/server'
import Thrower from './thrower'

// Dynamic so the client component only renders at request time (SSR), not at build time.
export default async function DynamicThrower({ id }) {
  await connection()
  return <Thrower id={id} />
}
