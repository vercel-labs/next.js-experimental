import Image from 'next/image'
import avif from './sample.avif'
import png from './sample.png'

export default function Page() {
  return (
    <main>
      <h1>Static AVIF import + next/image</h1>
      <pre id="avif-meta">{JSON.stringify(avif)}</pre>
      <pre id="png-meta">{JSON.stringify(png)}</pre>
      <Image id="avif-img" src={avif} alt="avif" />
      <Image id="png-img" src={png} alt="png" />
    </main>
  )
}
