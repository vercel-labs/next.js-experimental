export function createWorker(options = {}) {
  if (options.workerUrl) {
    // Runtime-only branch: only taken when the caller passes a worker URL.
    return new Worker(new URL(options.workerUrl, import.meta.url), {
      type: 'module',
    })
  }

  // Static fallback, which is the only branch this app can reach.
  return new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module',
  })
}
