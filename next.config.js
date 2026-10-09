/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    // Set LAZY=0 to turn the experiment off (control run: no errors).
    turbopackLazyDynamicImports: process.env.LAZY !== '0',
  },
}
