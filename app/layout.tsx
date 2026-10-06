import { Suspense } from 'react'
import { RouteAnalyticsReporter } from './route-analytics-reporter'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <RouteAnalyticsReporter />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
