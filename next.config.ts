import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    turbopackLazyDynamicImports: true,
    turbopackLazyDynamicImportsSSR: true,
  },
}

export default nextConfig
