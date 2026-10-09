import { useRouter } from 'next/navigation'

export function RouterComponent() {
  const router = useRouter()
  return (
    <button onClick={() => router.push('/next')}>Go</button>
  )
}
