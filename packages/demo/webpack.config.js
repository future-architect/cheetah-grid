'use strict'
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')

function getVueCheetahGridPath () {
  const vcgPath = path.resolve(__dirname, '../vue-cheetah-grid/dist/vueCheetahGrid.js')
  try {
    fs.statSync(vcgPath)
    return vcgPath
  } catch (err) {
    return 'vue-cheetah-grid'
  }
}
function getCheetahGridPath () {
  const cgPath = path.resolve(__dirname, '../cheetah-grid/dist/cheetahGrid.es5.js')
  try {
    fs.statSync(cgPath)
    return cgPath
  } catch (err) {
    return 'cheetah-grid'
  }
}
const devtoolModuleFilenameTemplate = ({ resourcePath }) => {
  if (resourcePath.indexOf('node_modules') >= 0) {
    resourcePath = resourcePath.substr(resourcePath.indexOf('node_modules'))
  }
  return `demo/${resourcePath}`
}
module.exports = (env, argv) => {
  const production = argv.mode === 'production'
  return {
  // context: path.join(__dirname, 'src'),
  // context: '/',
    entry: {
      app: ['@babel/polyfill', './src/main.js']
    },
    output: {
      path: production ? path.resolve(__dirname, '../../docs/assets') : path.resolve(__dirname, './.devdocs/assets'),
      filename: '[name].js',
      publicPath: './',
      devtoolModuleFilenameTemplate,
      devtoolFallbackModuleFilenameTemplate: devtoolModuleFilenameTemplate
    },
    externals: {
      'cheetah-grid': 'cheetahGrid',
      'vue-cheetah-grid': 'vueCheetahGrid'
    },
    resolveLoader: {
      modules: [path.resolve(__dirname, 'node_modules')]
    },
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules')],
      extensions: ['.js', '.json'],
      alias: {
        // vue$: 'vue/dist/vue.esm.js',
        'cheetah-grid': production ? 'cheetah-grid' : getCheetahGridPath(),
        // 'cheetah-grid': cheetahGridAliasPath,
        'vue-cheetah-grid': getVueCheetahGridPath()
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          include: [path.resolve(__dirname, 'src')],
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        // options: vueLoaderConfig
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            comments: true
            // compact: true
          },
          include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, '../vue-cheetah-grid')
          //, path.resolve(__dirname, '../cheetah-grid')
          ]
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'images/',
                publicPath: (path) => `./assets/images/${path}`
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin(production ? {
        'process.env': {
          NODE_ENV: '"production"'
        }
      } : {})
    ],
    devtool: production ? undefined : '#source-map'
  }
}
