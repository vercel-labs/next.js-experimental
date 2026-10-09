// Mimics a popular ESM package that supports a user-provided worker URL option
// alongside a static-path fallback.
export function createWorker(options = {}) {
  if (options.workerUrl) {
    // Runtime-only branch: only taken when the caller passes a worker URL.
    return new Worker(new URL(options.workerUrl, import.meta.url), {
      type: 'module',
    })
  }
  // Static fallback
  return new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
}
