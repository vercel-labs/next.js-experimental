import Image from 'next/image'
import hero from '../../public/hero.png'

// Control page: the second copy is ALSO eager, so no warning is logged.
export default function Page() {
  return (
    <main>
      <Image src={hero} alt="hero eager" width={1200} height={800} loading="eager" />
      <div style={{ height: '200vh' }}>scroll down</div>
      <Image src={hero} alt="hero second" width={1200} height={800} loading="eager" />
    </main>
  )
}
