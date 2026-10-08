export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script id="root-head-script" dangerouslySetInnerHTML={{ __html: 'window.__ROOT_HEAD__ = true' }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
