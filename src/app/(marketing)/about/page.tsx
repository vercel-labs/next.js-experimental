import { fetch3 } from '@/lib'

export default async function About() {
  return <main>about:{await fetch3()}</main>
}
