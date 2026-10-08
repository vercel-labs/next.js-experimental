import { StyleProvider } from './style-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyleProvider>{children}</StyleProvider>
      </body>
    </html>
  )
}
