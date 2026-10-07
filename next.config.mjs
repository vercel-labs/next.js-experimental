export default {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'nonce-staticnonce123' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ]
  },
}
