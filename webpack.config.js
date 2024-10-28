const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    search: "./src/js/search.js",
    results: "./src/js/results.js",
    common: "./src/js/common.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico|svg|mp4)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["common", "search"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/results.html",
      filename: "results.html",
      chunks: ["common", "results"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/images", to: "images" },
        { from: "src/icons", to: "icons" },
        { from: "src/videos", to: "videos" },
      ],
    }),
  ],
};
