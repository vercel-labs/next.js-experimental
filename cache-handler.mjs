// Minimal incremental cache handler backed by an in-memory Map that starts EMPTY.
// It models a shared cache (e.g. Redis) that does not contain the build output,
// or that has evicted / TTL-expired an entry. Every first request is a cache miss.
const store = new Map()

export default class CacheHandler {
  constructor() {}
  async get(key) {
    const hit = store.get(key) ?? null
    console.log(`[cache-handler] get ${hit ? 'HIT ' : 'MISS'} ${key}`)
    return hit
  }
  async set(key, data, ctx) {
    store.set(key, { value: data, lastModified: Date.now(), tags: ctx?.tags ?? [] })
  }
  async revalidateTag() {}
  resetRequestCache() {}
}
