import { dbName } from '@/lib'

export default async function Home() {
  return <main>home:{dbName()}</main>
}
