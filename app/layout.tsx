import Link from "next/link";

// German content so Chrome offers (and keeps) translation for English browsers.
// No `metadata.title` here on purpose: the home page has no title and no <h1>,
// so navigating back to it makes the route announcer announce an empty string.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <nav>
          <Link href="/">Startseite</Link> | <Link href="/titled">Seite mit Titel</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
