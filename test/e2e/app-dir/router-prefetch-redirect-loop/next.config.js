/** @type {import('next').NextConfig} */
module.exports = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    // An old URL that matches the dynamic `/[collection]/[...slug]` route
    // permanently redirects to a static route with a different tree shape.
    return [
      {
        source: '/docs/changelog/:path*',
        destination: '/changelog/:path*',
        permanent: true,
      },
    ]
  },
}
