// Spawns the worker. The worker's own module graph imports this file back.
export function spawnWorker() {
  return new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
}
