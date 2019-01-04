module.exports = {
  entry: {
    'index': './src/index.ts'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  output: {
    library: 'true',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new DtsBundlePlugin()
  ]
};

function DtsBundlePlugin() {}

DtsBundlePlugin.prototype.apply = function(compiler) {
  compiler.hooks.afterEmit.tap('DtsBundlePlugin', function() {
    const dts = require('dts-bundle');
    dts.bundle({
      name: 'axios-etag-cache',
      main: '.dts/index.d.ts',
      out: '../dist/index.d.ts',
      removeSource: true,
      outputAsModuleFolder: true
    });
  });
};
