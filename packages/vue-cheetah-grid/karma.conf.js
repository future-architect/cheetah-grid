const webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      require.resolve('promise-polyfills'),
      'test/polyfill.js',
      'test/init.js',
      'test/**/*.spec.js'
    ],

    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig({}, { mode: 'development', test: true }),

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text' }
      ]
    },
    browserNoActivityTimeout: 90000,
    browsers: ['Chrome'
    // 'IE_no_addons'
    ],
    customLaunchers: {
      IE_no_addons: {
        base: 'IE',
        flags: ['-extoff']
      },
      Chrome_travis_ci: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  })
}
