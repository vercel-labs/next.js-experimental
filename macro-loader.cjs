// Expands `m("text")` calls from the fake-macro module with Babel, the way a macro plugin does.
const { transformAsync } = require('@babel/core');

const expandMacro =
  (variant) =>
  ({ types: t }) => ({
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === 'fake-macro') path.remove();
      },
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, { name: 'm' }) && t.isStringLiteral(path.node.arguments[0])) {
          path.replaceWith(t.stringLiteral(`${path.node.arguments[0].value} [${variant}]`));
        }
      },
    },
  });

module.exports = function macroLoader(source) {
  const callback = this.async();
  const { variant } = this.getOptions();
  transformAsync(source, {
    filename: this.resourcePath,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['typescript', 'jsx'] },
    plugins: [expandMacro(variant)],
    sourceMaps: true,
  }).then((result) => callback(null, result.code, result.map), callback);
};
