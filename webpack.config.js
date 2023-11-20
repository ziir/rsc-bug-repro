"use strict";

const path = require("node:path");
const ReactServerWebpackPlugin = require("react-server-dom-webpack/plugin");

const mode = process.env.NODE_ENV || "development";
const development = mode === "development";

module.exports = {
  name: "client",
  mode,
  entry: "./src/client.js",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [new ReactServerWebpackPlugin({ isServer: false })],
  output: {
    chunkFilename: development
      ? "[id].chunk.js"
      : "[id].[contenthash].chunk.js",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  optimization: {
    runtimeChunk: "single",
  },
  devtool: development ? "cheap-module-source-map" : "source-map",
  watchOptions: {
    ignored: ["./server", "./public"],
  },
};
