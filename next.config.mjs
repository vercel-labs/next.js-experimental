export default {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Common CI setting to tolerate flaky data fetches during prerender.
    staticGenerationRetryCount: 5,
    prerenderEarlyExit: false,
  },
}
