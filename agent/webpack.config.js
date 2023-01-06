const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    agent: './src/agent/index.js'
  },
  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'public'),
    filename: '[name]-bundle.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        test: /\.(svg|png)$/,
        type: 'asset/resource'
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/agent/index.html',
      filename: 'index.html',
      chunks: ['agent'],
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    https: true
  },
  resolve: {
    fallback: {
      buffer: require.resolve("buffer/"),
    }
  }
};
