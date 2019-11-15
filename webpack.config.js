"use strict";

const path = require("path");

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV.trim() == "development";
console.log(isDevelopment);

module.exports = {
  target: "node",
  entry: isDevelopment ? "./index.js" : "./src/js/app",
  output: isDevelopment
    ? {
        path: path.join(__dirname, "build"),
        filename: "build.js",
        publicPath: "/build/"
      }
    : {
        path: path.join(__dirname, "distribute"),
        filename: "imagineslider.js",
        publicPath: "/distribute/"
      },
  devtool: isDevelopment ? "source-map" : "",
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: "/.js$/",
        use: [
          {
            loader: "babel-loader",
            options: { presets: ["env"] }
          }
        ]
      }
    ]
  }
};
