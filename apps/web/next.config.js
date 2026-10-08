module.exports = {
  transpilePackages: ['@repro/ui'],
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackMemoryEviction: 'full',
    turbopackGc: { minProgressMs: 0, rootTtlMs: 0 },
  },
}
