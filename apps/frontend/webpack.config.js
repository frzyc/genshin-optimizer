const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  // workaround https://github.com/nrwl/nx/issues/14532#issuecomment-1404290479
  config.module.rules = config.module.rules.map((rule) => {
    if (/file-loader/.test(rule.loader)) {
      return {
        ...rule,
        type: "javascript/auto", // This is fixing issue https://webpack.js.org/guides/asset-modules/
      };
    }

    return rule;
  });

  // https://github.com/nrwl/nx/issues/13628#issuecomment-1407416656
  config.output.scriptType = 'text/javascript'

  // https://github.com/nrwl/nx/issues/14680
  if (process.env.NODE_ENV === 'production')
    config.output.publicPath = "/genshin-optimizer/"

  return config;
});
