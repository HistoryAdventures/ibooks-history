const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    'scene-opium': './scene-opium/index.js',
    'scene-ioannina': './scene-ioannina/index.js',
    'scene-luis': './scene-luis/index.js',
    'scene-ishi': './scene-ishi/index.js',
    'scene-william': './scene-william/index.js',
    'scene-jonas': './scene-jonas/index.js',
    'scene-arun': './scene-arun/index.js',
    'scene-agent-v1': './scene-agent-v1/index.js',
    'scene-chicago-v1': './scene-chicago-v1/index.js',
    'scene-jemba-v1': './scene-jemba-v1/index.js',
    'scene-khari-v1': './scene-khari-v1/index.js',
    'scene-agent-3d': './scene-agent-3d/index.js',
    'scene-chicago-3d': './scene-chicago-3d/index.js',
    'scene-jemba-3d': './scene-jemba-3d/index.js',
    'scene-khari-3d': './scene-khari-3d/index.js',
    'scene-opium-3d': './scene-opium-3d/index.js',
    'scene-achraj': './scene-achraj/index.js',
    'scene-aztec': './scene-aztec/index.js',
    'scene-brian': './scene-brian/index.js',
    'scene-ghiana': './scene-ghiana/index.js',
    'scene-nikos': './scene-nikos/index.js',
    'documents/ioannina': './documents/ioannina/index.js',
    'documents/luis': './documents/luis/index.js',
    'documents/ishi': './documents/ishi/index.js',
    'documents/william': './documents/william/index.js',
    'documents/jonas': './documents/jonas/index.js',
    'documents/arun': './documents/arun/index.js',
    'documents/RiseFallOttomans': './documents/RiseFallOttomans/index.js',
    'documents/5routes': './documents/5routes/index.js',
    'documents/MughalEmpire': './documents/MughalEmpire/index.js',
    'documents/TriangularTrade': './documents/TriangularTrade/index.js',
    'documents/BeforeAfter': './documents/BeforeAfter/index.js',
    'documents/BlackbeardsBeauty': './documents/BlackbeardsBeauty/index.js',
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
            presets: [
              ['@babel/preset-env']
            ],
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
