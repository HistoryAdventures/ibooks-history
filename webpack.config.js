const path = require('path');

module.exports = {
  entry: './scene1/index.js',
  // mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './scene1')
  },
  devServer: {
    contentBase: './scene1',
    disableHostCheck: true
  },
};
