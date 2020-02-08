const path = require("path");
const scene = "scene-khari";

module.exports = {
  entry: `./${scene}/index.js`,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ["@babel/plugin-transform-template-literals"]
          }
        }
      }
    ]
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, `./${scene}`)
  },
  devServer: {
    contentBase: `./${scene}`,
    disableHostCheck: true
  }
};
