import { ThemeProvider } from '../components/theme'
import { Nav } from '../components/nav'

export const metadata = { title: 'repro' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Nav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
