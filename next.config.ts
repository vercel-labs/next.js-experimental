import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Top-level flag (see config-schema: partialPrefetching)
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    exposeTestingApiInProductionBuild: true,
  },
}

export default nextConfig
