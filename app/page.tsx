import Image from 'next/image'

export default function Page() {
  return (
    <main>
      <h1>priority hero</h1>
      <Image id="hero" src="/hero.jpg" priority width={1200} height={600} alt="hero" />
      <Image
        id="hero-manual"
        src="/hero.jpg"
        priority
        fetchPriority="high"
        width={1200}
        height={600}
        alt="hero manual"
      />
    </main>
  )
}
