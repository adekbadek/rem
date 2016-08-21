var ProgressBarPlugin = require('progress-bar-webpack-plugin')

module.exports = {
  entry: {
    app: './front/app.js'
  },
  output: {
    path: './assets/_js',
    filename: '[name].js' // Template based on keys in entry above
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.sass$/,
        loaders: ['style', 'css', 'sass']
      }
    ]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ['', '.js', '.json', '.sass']
  },
  plugins: [
    new ProgressBarPlugin({width: 200, clear: false})
  ]
}
