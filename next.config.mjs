/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Turn these off to see the dev server log stay clean (control run).
    turbopackLazyDynamicImports: true,
    turbopackLazyDynamicImportsSSR: true,
  },
}
export default nextConfig
