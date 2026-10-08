export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header id="root-layout-header">ROOT LAYOUT HEADER</header>
        {children}
      </body>
    </html>
  );
}
