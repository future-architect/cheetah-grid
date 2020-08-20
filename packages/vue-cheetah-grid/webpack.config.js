'use strict'
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')
const rm = require('rimraf')
const webpack = require('webpack')
const PACKAGEJSON = require('./package.json')
const BANNER = `/*!
 * vue-cheetah-grid - Cheetah Grid for Vue.js
 * @version v${PACKAGEJSON.version}
 * @license ${PACKAGEJSON.license}
 *
 * [Cheetah Grid](https://github.com/future-architect/cheetah-grid)
 * [Vue.js](https://vuejs.org)
 */`

const devtoolModuleFilenameTemplate = ({ resourcePath }) => {
  if (resourcePath.indexOf('node_modules') >= 0) {
    resourcePath = resourcePath.substr(resourcePath.indexOf('node_modules'))
  }
  return `vue-cheetah-grid/${resourcePath}`
}
module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    rm.sync(path.join(path.resolve(__dirname, './dist'), '*'))
  }
  return {
    mode: argv.mode,
    entry: {
      vueCheetahGrid: './lib/index.js'
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].js',
      library: '[name]',
      libraryTarget: 'umd',
      devtoolModuleFilenameTemplate,
      devtoolFallbackModuleFilenameTemplate: devtoolModuleFilenameTemplate
    },
    externals: argv.test ? undefined : {
      vue: {
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue',
        root: 'Vue'
      },
      'cheetah-grid': {
        commonjs: 'cheetah-grid',
        commonjs2: 'cheetah-grid',
        amd: 'cheetah-grid',
        root: 'cheetahGrid'
      }
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: argv.test ? {
        'cheetah-grid': path.resolve(__dirname, '../cheetah-grid')
      } : undefined
    },
    module: {
      rules: [
        {
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          exclude: /node_modules/
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            cssSourceMap: argv.mode !== 'production'
          },
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: file => (
            /node_modules/.test(file) &&
            !/\.vue\.js/.test(file)
          )
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: false,
                plugins: [
                  require('cssnano')({
                    preset: 'default'
                  }),
                  require('autoprefixer')({
                    grid: true
                  })
                ]
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.BannerPlugin({ banner: BANNER, raw: true, entryOnly: true }),
      new webpack.DefinePlugin(argv.mode === 'production' ? {
        'process.env': {
          NODE_ENV: '"production"'
        }
      } : {})
    ],
    devtool: argv.test ? 'eval-source-map' : '#source-map'
  }
}
