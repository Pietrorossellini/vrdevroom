var webpack = require('webpack')
var path = require('path')

var isProd = process.env.NODE_ENV === 'production'
var isTest = process.env.NODE_ENV === 'test'

var plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
]

var entry = [
  '../client/index.js'
]

if (!isProd && !isTest) entry.push(
  'webpack-dev-server/client?http://localhost:8080',
  'webpack/hot/dev-server'
)

if (isProd) plugins.push(new webpack.optimize.UglifyJsPlugin({
  compress: {warnings: false}
}))

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, '..', 'public'),
    filename: 'bundle.js'
  },
  devtool: 'inline-sourcemap',
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader?presets[]=es2015']
      },
      {
        test: /\.html$/,
        loaders: ['raw-loader']
      }
    ]
  }
}