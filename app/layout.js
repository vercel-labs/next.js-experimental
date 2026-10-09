import { getSiteName } from './cached'

export default async function RootLayout({ children }) {
  const name = await getSiteName()
  return (
    <html>
      <body>
        <header>{name}</header>
        {children}
      </body>
    </html>
  )
}
