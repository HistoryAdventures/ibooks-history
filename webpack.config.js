const path = require('path');

module.exports = {
  entry: {
    'scene-agent': './scene-agent/index.js',
    'scene-chicago': './scene-chicago/index.js',
    'scene-jemba': './scene-jemba/index.js',
    'scene-khari': './scene-khari/index.js',
    'scene-opium': './scene-opium/index.js',
    'scene-video': './scene-video/index.js',
    'scene-ioannina': './scene-ioannina/index.js',
    'scene-luis': './scene-luis/index.js',
    'scene-ishi': './scene-ishi/index.js',
    'scene-william': './scene-william/index.js',
    'scene-jonas': './scene-jonas/index.js',
    'scene-arun': './scene-arun/index.js',
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-template-literals']
          }
        }
      }
    ]
  },
  output: {
    filename: '[name]/main.js',
    path: __dirname,
  },
  resolve: {
    alias: {
      '@scripts': path.resolve(__dirname, 'scripts'),
    }
  },
  devServer: {
    contentBase: './',
    disableHostCheck: true,
  }
};
