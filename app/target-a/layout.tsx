import { TargetShell } from '../components/deferred'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TargetShell id="a">{children}</TargetShell>
}
