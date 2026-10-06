import Link from 'next/link'

// Typical mobile layout: a round navigation button pinned to the bottom-left
// corner, which is exactly where the Next.js dev indicator renders.
export default function Home() {
  return (
    <main>
      <p style={{ padding: 16 }}>Home</p>
      <Link href="/menu">
        <button
          id="menu-button"
          aria-label="Open menu"
          style={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            width: 48,
            height: 48,
            borderRadius: 24,
            border: '1px solid #333',
            background: '#fff',
          }}
        >
          ☰
        </button>
      </Link>
    </main>
  )
}
