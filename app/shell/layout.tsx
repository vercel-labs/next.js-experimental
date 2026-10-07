import CanvasClient from '../../components/canvas-client'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="shell">
      <CanvasClient />
      {children}
    </div>
  )
}
