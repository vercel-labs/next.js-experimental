// LOADER=off|on adds or removes the loader rule; LOADER_VARIANT changes its options. Both change the compile pipeline.
const variant = process.env.LOADER_VARIANT ?? 'a';
const withLoader = process.env.LOADER !== 'off';

export default {
  typescript: { ignoreBuildErrors: true },
  reactCompiler: process.env.REACT_COMPILER === '1',
  experimental: {
    turbopackRustReactCompiler: process.env.REACT_COMPILER === '1',
    ...(process.env.GC === '1' ? { turbopackGc: true } : {}),
  },
  turbopack: withLoader
    ? {
        rules: {
          '*.tsx': {
            condition: { content: /from ['"]fake-macro['"]/ },
            loaders: [{ loader: './macro-loader.cjs', options: { variant } }],
          },
        },
      }
    : {},
};
