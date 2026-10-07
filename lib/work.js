// This import closes the cycle: worker.js -> work.js -> spawn.js -> worker.js
import { spawnWorker } from './spawn.js'

export function doWork(n) {
  return n * 2
}

export function runInWorker(n) {
  const w = spawnWorker()
  w.postMessage(n)
  return w
}
