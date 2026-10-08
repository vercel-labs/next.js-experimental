const custom = process.env.CUSTOM_CACHE === '1'

/** @type {import('next').NextConfig} */
export default {
  cacheComponents: true,
  ...(custom && {
    cacheHandler: new URL('./cache-handler.mjs', import.meta.url).pathname,
    cacheMaxMemorySize: 0,
  }),
}
