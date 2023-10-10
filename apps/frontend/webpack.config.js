const { composePlugins, withNx } = require('@nx/webpack')
const { withReact } = require('@nx/react')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  // https://github.com/nrwl/nx/issues/10017#issuecomment-1405429851
  // Fix to web workers not working
  config.output.scriptType = 'text/javascript'

  return config
})
