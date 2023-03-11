const { composePlugins, withNx } = require('@nrwl/webpack')
const { withReact } = require('@nrwl/react')
const TerserJSPlugin = require('terser-webpack-plugin')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  // https://github.com/nrwl/nx/issues/10017#issuecomment-1405429851
  // Fix to web workers not working
  config.output.scriptType = 'text/javascript'

  // https://github.com/nrwl/nx/issues/14483#issuecomment-1424029390

  // Fix 1: resolves tree-shaking issue caused by using custom webpack config
  // The default is [ 'browser', 'main', 'module' ]. Thus, 'main' had preference over 'module' when Webpack reads the `package.json` files, which is not what we want. Module should become before main - the order matters!
  // See https://webpack.js.org/configuration/resolve/#resolvemainfields
  config.resolve.mainFields = ['browser', 'module', 'main']

  // Fix 2: resolves minification issue by adding Terser. Terser is also capable of eliminating dead code.
  // TerserJS is the Webpack 5 default minifier but we have to specify it explicitly as soon as we include more minifiers
  config.optimization.minimizer.unshift(new TerserJSPlugin())

  return config
})
