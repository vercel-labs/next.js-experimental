import { dbName } from '@/lib'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  return <section data-db={dbName()}>{children}</section>
}
