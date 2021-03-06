
// node/full

module.exports = {
  mode: 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        loader: "eslint-loader",
        exclude: /node_modules/,
        options: {
          emitWarning: true,
          configFile: "./.eslintrc.json"
        }
      }
    ]
  },
  output: {
    path: require('path').resolve(__dirname, '../lib'),
    library: 'RiTa',
    filename: 'rita.js',
    libraryTarget: 'commonjs2',
  },
  node: {
    fs: "empty",
    __dirname: false,
    __filename: false,
  },
  watchOptions: {
    ignored: /node_modules/
  },
  externals: ['he', 'flatted/cjs', 'deepmerge', 'antlr4', /^antlr4\/.+$/ ],
  entry: './src/rita.js',
  plugins: [new (require('webpack').DefinePlugin)({
    __VERSION__: JSON.stringify(require("../package.json").version)
  })]
};
