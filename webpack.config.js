const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin"); // Import the plugin

module.exports = {
  entry: {
    search: "./src/js/search.js",
    results: "./src/js/results.js",
    common: "./src/js/common.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    open: true,
    hot: true,
  },
  module: {
    rules: [
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
    new Dotenv(),
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
        { from: "src/images", to: "images" }, // Copies images
        { from: "src/icons", to: "icons" }, // Copies icons
        { from: "src/videos", to: "videos" }, // Copies videos
      ],
    }),
  ],
};
