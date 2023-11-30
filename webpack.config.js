const path = require('path');
const process = require('process');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

/**
 * @type {import('webpack-pwa-manifest').ManifestOptions}
 */
const webManifestConfig = {
  filename: 'manifest.webmanifest',
  fingerprints: false,
  name: 'Pokemon Explorer',
  short_name: 'PokemonExp',
  description: 'Pokemon Explorer!',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  icons: [
    {
      src: 'src/logo.svg',
      sizes: 'any',
      purpose: 'any maskable',
    },
  ],
};

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: './src/index',
  module: {
    rules: [
      {
        test: /\.(svg|bmp|gif|jpe?g|png|webp)$/,
        use: ['file-loader'],
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          // 导入自定义元素源代码才有 tag、类型绑定
          allowTsInNodeModules: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    publicPath: '/',
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new WebpackManifestPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: webManifestConfig.name,
      favicon: webManifestConfig.icons[0].src,
      meta: {
        description: webManifestConfig.description,
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
    }),
  ].concat(isProd ? [new WebpackPwaManifest(webManifestConfig), new GenerateSW()] : []),
  devServer: {
    open: true,
    static: {
      directory: './build',
    },
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
