export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script id="head-probe" dangerouslySetInnerHTML={{ __html: 'window.__HEAD_PROBE__ = true' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
