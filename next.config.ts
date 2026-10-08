import type { NextConfig } from 'next'

// Bump CONFIG_REV (via scripts/stress.mjs) to force the dev server to restart.
const CONFIG_REV = 0

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    turbopackGc: {
      // Age roots out aggressively so GC actually collects during a short session.
      minProgressMs: 1,
      rootTtlMs: 1,
    },
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackMemoryEviction: 'full',
  },
  env: { CONFIG_REV: String(CONFIG_REV) },
}

export default nextConfig
