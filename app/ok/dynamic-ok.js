import { connection } from 'next/server'
import Ok from './ok'

export default async function DynamicOk({ id }) {
  await connection()
  return <Ok id={id} />
}
