const path = require('path');
module.exports = {
  entry: './src/App.jsx',
  output: {
    path: path.resolve('docs/alpha'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { 
        test: /\.jsx?$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react']
        }
      },
    ]
  }
}