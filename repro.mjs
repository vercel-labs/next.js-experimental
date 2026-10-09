import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = import.meta.dirname
const control = process.argv.includes('--control')

// Build an alternate spelling of the project directory. On Windows this is
// what you get for free by `cd`-ing into the project with different casing
// (c:\dev\portfolio vs C:\Dev\portfolio) before running `npm run build`.
const aliasDir = path.join(root, '.case-alias')
fs.rmSync(aliasDir, { recursive: true, force: true })
fs.mkdirSync(aliasDir)
fs.symlinkSync(root, path.join(aliasDir, 'Project'), 'dir') // canonical spelling
fs.symlinkSync(root, path.join(aliasDir, 'project'), 'dir') // mis-cased spelling

// control = the canonical path of the project, i.e. what Windows would use if
// realpath canonicalized casing; repro = the mis-cased spelling.
const dir = control ? root : path.join(aliasDir, 'project')

fs.rmSync(path.join(root, '.next'), { recursive: true, force: true })

const res = spawnSync(
  process.execPath,
  [
    path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'),
    'build',
    '--webpack',
    '--debug-prerender',
    dir,
  ],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --require ${path.join(root, 'emulate-windows-realpath.cjs')}`,
    },
  }
)
console.log(`\nnext build exited with code ${res.status} (dir: ${dir})`)
process.exit(res.status ?? 1)
