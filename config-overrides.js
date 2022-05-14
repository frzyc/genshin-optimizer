module.exports = function override(config, env) {
    config.experiments = {asyncWebAssembly: true, syncWebAssembly: true}
    config.resolve.fallback = {fs: false, path: false}
    return config;
};

module.rules = function override(config, env) {
    return [{
        test: /assembly\.js$/, loader: `exports-loader`, options: {
            type: `Module`, exports: `Module`,
        },
    }, {
        test: /.*\.wasm$/, type: `javascript/auto`, loader: `file-loader`,
    }];
};