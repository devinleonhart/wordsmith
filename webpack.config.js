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
    mode: env.production ? "production" : "development",
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
  if(config.mode == "production") {
    config.devtool = "inline-source-map";
  }
  else if(config.mode == "development") {
    config.devtool = "source-map";
  }

  return config;
};
