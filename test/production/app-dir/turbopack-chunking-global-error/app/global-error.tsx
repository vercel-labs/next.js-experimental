'use client'

import { ThemeProvider } from '../components/theme'
import { Nav } from '../components/nav'

export default function GlobalError() {
  return (
    <html>
      <body>
        <ThemeProvider>
          <Nav />
          <h1 id="global-error">global error</h1>
        </ThemeProvider>
      </body>
    </html>
  )
}
