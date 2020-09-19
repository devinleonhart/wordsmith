const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env) => {

  // Plugins

  // Cleans dist folder on every build.
  // https://www.npmjs.com/package/clean-webpack-plugin
  const cleanWebpackPlugin = new CleanWebpackPlugin();

  // Loaders

  // EsLint for both .js and .ts.
  // https://github.com/webpack-contrib/eslint-loader
  const lintingLoader = {
    enforce: "pre",
    test: /\.(js|ts)$/,
    loader: "eslint-loader",
    exclude: /node_modules/,
  };

  // Typescript Loader
  const typescriptLoader = {
    test: /\.tsx?$/,
    use: "ts-loader",
    exclude: /node_modules/,
  };


  // Build Config
  const config = {
    entry: "./app.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "app.js",
    },
    target: "node",
    externals: [nodeExternals()],
    module: {
      rules: [
        lintingLoader,
        typescriptLoader,
      ],
    },
    resolve: {
      extensions: [".js", ".ts"],
    },
    plugins: [
      cleanWebpackPlugin,
    ],
  };

  // Environment Dependent Config

  const isDevelopment = env === "development";
  const isProduction = env === "production";

  if(isDevelopment) {
    config.mode = "development";
    config.devtool = "inline-source-map";
  }

  if(isProduction) {
    config.mode = "production";
    config.devtool = "source-map";
  }

  return config;
};
