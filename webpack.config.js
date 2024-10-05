import Dotenv from "dotenv-webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const plugins = [
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
];

if (process.env.NODE_ENV !== "production") {
  plugins.push(new Dotenv());
}

export default {
  entry: {
    search: "./src/js/search.js",
    results: "./src/js/results.js",
    common: "./src/js/common.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(process.cwd(), "dist"),
    publicPath: "",
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool:
    process.env.NODE_ENV === "production" ? "source-map" : "inline-source-map",
  devServer: {
    static: {
      directory: path.join(process.cwd(), "dist"),
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
  plugins: plugins,
};
