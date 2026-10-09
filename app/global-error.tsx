'use client'
import { ThemeProvider } from '../components/theme'
import { Nav } from '../components/nav'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Nav />
          <h1>Something went wrong</h1>
          <p>{error?.message}</p>
          <button onClick={reset}>Retry</button>
        </ThemeProvider>
      </body>
    </html>
  )
}
