// Copies vendor/ui-lib into node_modules/ui-lib as a *physical* package so that
// Turbopack/Next treats its frames as ignore-listed third-party code.
import { cp, rm, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dest = path.join(root, 'node_modules', 'ui-lib')
await rm(dest, { recursive: true, force: true })
await mkdir(path.dirname(dest), { recursive: true })
await cp(path.join(root, 'vendor', 'ui-lib'), dest, { recursive: true })
console.log('installed vendor ui-lib ->', dest)
