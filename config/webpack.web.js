// web/full

module.exports =
{
  mode: 'development',
  target: 'web',
  output: {
    path: require('path').resolve(__dirname, '../lib'),
    library: 'RiTa',
    filename: 'rita-web.js'
  },
  performance: {
    hints: false
  },
  watchOptions: {
    ignored: /node_modules/
  },
//  watch: true,
  node: {
    fs: "empty"
  },
  entry: './src/rita.js',
  plugins: [new (require('webpack').DefinePlugin)({
    __VERSION__: JSON.stringify(require("../package.json").version)
  })]
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all'
  //       }
  //     }
  //   }
  // }
};
