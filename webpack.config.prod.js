var webpack = require('webpack')

var devConfig = require('./webpack.config.dev.js')

module.exports = {
  devtool: 'source-map',
  entry: [
    './front/app.js'
  ],
  output: {
    path: devConfig.output.path,
    filename: devConfig.output.filename,
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  postcss: devConfig.postcss,
  resolve: devConfig.resolve,
  module: {
    loaders: devConfig.module.loaders
  }
}
