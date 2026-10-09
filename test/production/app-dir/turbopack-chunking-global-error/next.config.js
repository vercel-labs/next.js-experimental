module.exports = {
  experimental: {
    // Human-readable module ids make it possible to detect the same source
    // module being emitted into more than one client chunk.
    turbopackModuleIds: 'named',
  },
}
