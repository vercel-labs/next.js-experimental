// Only needed to reproduce on Linux/macOS.
//
// next/dist/lib/realpath.js:
//   const realpathSync = isWindows ? fs.realpathSync : fs.realpathSync.native
//
// On Windows the JS implementation of fs.realpathSync does NOT canonicalize
// directory-name casing, so getProjectDir() hands the mis-cased project dir
// straight through to the build. This shim makes realpath a no-op so a POSIX
// box behaves the same way. On Windows you do not need this file at all.
const fs = require('fs')
const identity = (p) => p
fs.realpathSync = Object.assign(identity, { native: identity })
fs.realpath = Object.assign(
  (p, o, cb) => process.nextTick(() => (cb || o)(null, p)),
  { native: (p, o, cb) => process.nextTick(() => (cb || o)(null, p)) }
)
if (fs.promises) fs.promises.realpath = async (p) => p
