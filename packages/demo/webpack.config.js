'use strict'
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const {
  VueLoaderPlugin
} = require('vue-loader')

function getVueCheetahGridPath () {
  const vcgPath = path.resolve(__dirname, '../vue-cheetah-grid')
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
  if (production) {
    const from = path.resolve(__dirname, './animals-icons')
    const to = path.resolve(__dirname, '../../docs/animals-icons')
    if (fs.existsSync(to)) {
      for (const fileName of fs.readdirSync(to)) {
        fs.unlinkSync(
          path.resolve(path.join(to, fileName))
        )
      }
    } else {
      fs.mkdirSync(to)
    }
    for (const fileName of fs.readdirSync(from)) {
      fs.copyFileSync(
        path.resolve(path.join(from, fileName)),
        path.resolve(path.join(to, fileName))
      )
    }
  }
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
    externals: production ? {
      'cheetah-grid': 'cheetahGrid',
      vue: 'Vue'
    } : { vue: 'Vue' },
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
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
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
      new VueLoaderPlugin(),
      new webpack.DefinePlugin(production ? {
        'process.env': {
          NODE_ENV: '"production"'
        },
        __VUE_PROD_DEVTOOLS__: '"false"'
      } : {})
    ],
    devtool: production ? undefined : '#source-map'
  }
}
