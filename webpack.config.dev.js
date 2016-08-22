var ProgressBarPlugin = require('progress-bar-webpack-plugin')
var autoprefixer = require('autoprefixer')
var webpack = require('webpack')

var path = require('path')

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './front/app.js'
  ],
  output: {
    path: path.join(__dirname, 'assets/js'),
    filename: 'app.js',
    publicPath: '/devserver/'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.sass$/,
        loaders: ['style', 'css', 'postcss-loader', 'sass']
      }
    ]
  },
  postcss: function () {
    return [autoprefixer]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ['', '.js', '.jsx', '.json', '.sass']
  },
  plugins: [
    new ProgressBarPlugin({width: 20, clear: false}),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}
