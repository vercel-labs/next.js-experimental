// Generates the Vercel Node launcher (___next_launcher.cjs) exactly as
// @vercel/next does for a Next 16 adapter build, into the project root.
const { getHandlerSource } = require('@vercel/next/dist/adapter/node-handler.js')
const fs = require('fs')
const path = require('path')

let src = getHandlerSource({
  isMiddleware: false,
  projectRelativeDistDir: '.next',
  prerenderFallbackFalseMap: {},
  nextConfig: {},
  nextEnvLoaderPathRelativeToProjectDir: '',
})
// `next/setup-node-env` only exists in the deployed layer for some versions
src = src.replace(
  "require('next/setup-node-env');",
  "try { require('next/setup-node-env') } catch {}"
)
fs.writeFileSync(path.join(__dirname, '..', '___next_launcher.cjs'), src)
console.log('wrote ___next_launcher.cjs')
