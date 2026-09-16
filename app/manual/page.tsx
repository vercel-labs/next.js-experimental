import Image from 'next/image'

export default function Page() {
  return (
    <Image
      id="hero-manual"
      src="/hero.jpg"
      priority
      fetchPriority="high"
      width={1200}
      height={600}
      alt="hero manual"
    />
  )
}
