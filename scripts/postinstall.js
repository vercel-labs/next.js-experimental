// npm links `file:` dependencies as symlinks, and symlinked sources are NOT
// ignore-listed by Next.js. Copy the fake third-party package into
// node_modules for real so its frames are ignore-listed like a published
// npm package would be.
const fs = require('fs')
const path = require('path')
const dest = path.join(__dirname, '..', 'node_modules', 'fake-carousel')
const src = path.join(__dirname, '..', 'packages', 'fake-carousel')
try {
  fs.rmSync(dest, { recursive: true, force: true })
} catch {}
fs.cpSync(src, dest, { recursive: true, dereference: true })
console.log('[postinstall] materialized node_modules/fake-carousel')
