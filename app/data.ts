import { cacheLife } from "next/cache";

// Stands in for any cached data source. `at` is the time the cache entry was filled,
// so a page that shows an old `at` was served from a stale cache entry.
export async function getThing(id: string) {
  "use cache";
  cacheLife("r10");
  return { id, at: Date.now() };
}
