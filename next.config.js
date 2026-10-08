/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    // Turbopack persistent (file system) cache. Both already default to `true`
    // in Next.js 16.4.0; set explicitly so this repro does not depend on the
    // defaults.
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,

    // Optional: uncomment to make turbo-tasks drop tasks from memory after
    // every snapshot and garbage collect aggressively, so tasks only live in
    // the persistent cache. Used by stress.sh / concurrent.sh.
    // turbopackMemoryEviction: 'full',
    // turbopackGc: { minProgressMs: 0, rootTtlMs: 1000 },
  },
}
