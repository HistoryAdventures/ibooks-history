const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    'scene-opium': './scene-opium/index.js',
    'scene-video': './scene-video/index.js',
    'scene-ioannina': './scene-ioannina/index.js',
    'scene-luis': './scene-luis/index.js',
    'scene-ishi': './scene-ishi/index.js',
    'scene-william': './scene-william/index.js',
    'scene-jonas': './scene-jonas/index.js',
    'scene-arun': './scene-arun/index.js',
    'documents/ioannina': './documents/ioannina/index.js',
    'documents/luis': './documents/luis/index.js',
    'documents/ishi': './documents/ishi/index.js',
    'documents/william': './documents/william/index.js',
    'documents/jonas': './documents/jonas/index.js',
    'documents/arun': './documents/arun/index.js',
    'documents/RiseFallOttomans': './documents/RiseFallOttomans/index.js',
    'quiz/luis': './quiz/luis/index.js',
    'quiz/arun': './quiz/arun/index.js',
    'quiz/ioannina': './quiz/ioannina/index.js',
    'quiz/ishi': './quiz/ishi/index.js',
    'quiz/jonas': './quiz/jonas/index.js',
    'quiz/william': './quiz/william/index.js',
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
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
           // Creates `style` nodes from JS strings
           'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ],
      },
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
  plugins: [
    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => { 
        if (name.indexOf('documents') !== -1 || name.indexOf('quiz') !== -1) {
          return `${name}/config.css`;
        }

        return `${name}/style.css`;
      },
    }),
  ],
  devServer: {
    contentBase: ['./', path.join(__dirname, 'shared'), path.join(__dirname, 'documents/_shared')],
    disableHostCheck: true,
    historyApiFallback: {
      index: 'documents/_shared/index.html',
      rewrites: [
        { from: /fonts.css/, to: '/fonts.css' },
        { from: /fonts-favorit.css/, to: '/fonts-favorit.css' },
        { from: /fonts\/Favorit\/Favorit_Regular.otf/, to: '/fonts/Favorit/Favorit_Regular.otf' },
        { from: /fonts\/Lyno%20Family\/LynoStan.otf/, to: '/fonts/Lyno%20Family/LynoStan.otf' },
        { from: /fonts\/Lyno%20Family\/LynoUlys.otf/, to: '/fonts/Lyno%20Family/LynoUlys.otf' },
      ]
    },
  }
};
