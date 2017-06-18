const path = require('path');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, "/public/"),
    filename: 'bundle.js'
  },
  //Allow us to place index.html in a different position.
  devServer: {
      contentBase: './public/'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
  },
  module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader'
      //, include: [path.resolve(__dirname, 'src/app')
    },
      { test:/\.css$/, loader:'style-loader!css-loader', exclude: /node_modules/},
      //{ test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader', exclude: /node_modules/}
      { test: /\.scss$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: [ 'css-loader', 'sass-loader' ] }) }
    ]
  },
  plugins: [
      new ExtractTextPlugin("style.css")
  ],
  devtool: 'inline-source-map'
}
