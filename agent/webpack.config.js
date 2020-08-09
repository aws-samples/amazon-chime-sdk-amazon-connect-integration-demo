const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    agent: './src/agent/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name]-bundle.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
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
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets'
          }
        }
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
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080,
    disableHostCheck: true,
    https: true
  },
};
