import path from "path";
import { Configuration } from "webpack";
import TerserWebpackPlugin from "terser-webpack-plugin";
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;
const tailwindcss = require("tailwindcss");
import autoprefixer from "autoprefixer";

const config: Configuration = {
  entry: {
    wc: "./src/component.tsx",
    lib: "./src/lib.ts",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  throwIfNamespace: false,
                  runtime: "automatic",
                  importSource: "atomico",
                },
              ],
              [
                "@babel/plugin-transform-runtime",
                {
                  regenerator: true,
                },
              ],
              "@babel/plugin-syntax-dynamic-import",
            ],
          },
        },
      },
      {
        test: /\.css?$/,
        use: [
          // {
          //     loader: "style-loader"
          // },
          {
            loader: "css-loader",
            options: {
              exportType: "string",
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [[autoprefixer], [tailwindcss]],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
  },
  devtool: "source-map",
  optimization: {
    minimize: false,
    minimizer: [new TerserWebpackPlugin()],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "fed.[name].js",
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "fed_container",
    }),
  ],
};

export default config;
