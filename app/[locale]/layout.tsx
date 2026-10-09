import Link from 'next/link'
import { NODES } from '../../content'

// The whole route is required to be fully static, including navigations.
export const ensureStatic = 'navigation'

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>
        {NODES.map((node) => (
          <Link key={node} href={`/en/${node}`} prefetch={true}>
            {node}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
