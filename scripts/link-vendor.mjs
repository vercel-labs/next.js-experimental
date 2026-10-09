// Copies the fake third-party package into node_modules so that its frames are
// ignore-listed by Next.js (as they would be for any real npm dependency).
import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('node_modules/time-lib', { recursive: true })
cpSync('vendor/time-lib', 'node_modules/time-lib', { recursive: true })
