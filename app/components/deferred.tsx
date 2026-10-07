import { Suspense } from 'react'
import { prefetch } from 'next/cache'
import { cookies } from 'next/headers'

export function TargetShell({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2>Target {id} layout (App Shell)</h2>
      <Suspense fallback={<p>Loading deferred layout content...</p>}>
        <DeferredLayoutContent id={id} />
      </Suspense>
      {children}
    </div>
  )
}

async function DeferredLayoutContent({ id }: { id: string }) {
  await prefetch()
  const session = (await cookies()).get('session')?.value ?? 'anonymous'
  console.log(`[server] DEFERRED_RENDERED target=${id} session=${session}`)
  return <p>Deferred layout content for {session}</p>
}
