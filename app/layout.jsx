export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/*
          Opt-in simulation of a third-party focus-trap / a11y script (the kind of
          `markOthers()` implementation used by modal libraries) that sets `inert`
          on DOM nodes before React hydrates them.

          It only runs when the page is loaded with `?third-party=1`.
          No application component ever passes an `inert` prop.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (location.search.includes('third-party')) {
                new MutationObserver((records) => {
                  for (const r of records) {
                    for (const n of r.addedNodes) {
                      if (n.nodeType === 1 && n.classList && n.classList.contains('box') && !n.hasAttribute('inert')) {
                        n.setAttribute('inert', '')
                      }
                    }
                  }
                }).observe(document, { childList: true, subtree: true })
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
