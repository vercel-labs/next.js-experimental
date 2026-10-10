export default {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['./loaders/identity-css-loader.cjs'],
        as: '*.css',
      },
    },
  },
}
