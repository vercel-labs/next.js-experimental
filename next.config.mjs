/** @type {import('next').NextConfig} */
export default {
  experimental: {
    // Only so that analyze.mjs can read module ids from the emitted chunks.
    turbopackModuleIds: 'named',
  },
}
