import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
  // Short revalidate so the repro runs in seconds. Optional PROBE_MEM forces LRU eviction.
  cacheLife: { r10: { stale: 300, revalidate: 10, expire: 31536000 } },
  ...(process.env.PROBE_MEM ? { cacheMaxMemorySize: Number(process.env.PROBE_MEM) } : {}),
};

export default nextConfig;
