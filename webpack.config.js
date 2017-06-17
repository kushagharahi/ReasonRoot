const path = require('path');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  //
  output: {
    path: path.resolve(__dirname, "/public"),
    filename: 'bundle.js'
  },
  //Allows to load a index.html out of root.
  devServer: {
      contentBase: './public/'
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "/src"),
    },
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
  },
  module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.ts$/, loader: 'ts-loader',
      //include: [path.resolve(__dirname, '/src/app')]
    },
      { test: /\.css$/, loader:'style-loader!css-loader', exclude: /node_modules/},
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader', exclude: /node_modules/}
      //{ test: /\.scss$  /, loader: ExtractTextPlugin.extract('css!sass') }
    ]
  },
  //plugins: [
  //    new ExtractTextPlugin("style.css")
  //],
  devtool: 'inline-source-map'
}
