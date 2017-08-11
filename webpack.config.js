const path = require('path');

module.exports = {
  entry: './dist/index.js',
  output: {
    path: path.resolve(__dirname, "/public/"),
    filename: 'bundle.js',
    library: 'bundle'
  },
  //Allow us to place index.html in a different position that root.
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
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: path.resolve(__dirname, '/node_modules'),
      include: path.resolve(__dirname, '/src/app')
    },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader', exclude: path.resolve(__dirname, '/node_modules')}
    ]
  },
  devtool: 'inline-source-map'
}
