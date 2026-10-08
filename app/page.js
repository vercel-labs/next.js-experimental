import Image from 'next/image'
import hero from '../public/hero.png'

export default function Page() {
  return (
    <main>
      {/* Above the fold, explicitly eager. This is the LCP element. */}
      <Image src={hero} alt="hero eager" width={1200} height={800} loading="eager" />

      <div style={{ height: '200vh' }}>scroll down</div>

      {/* Same src, same width, default lazy loading, far below the fold. */}
      <Image src={hero} alt="hero lazy" width={1200} height={800} />
    </main>
  )
}
