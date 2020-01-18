const path = require("path");
const scene = "agent01";

module.exports = {
  entry: `./${scene}/index.js`,
  // mode: 'production',
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, `./${scene}`)
  },
  devServer: {
    contentBase: `./${scene}`,
    disableHostCheck: true
  }
};
