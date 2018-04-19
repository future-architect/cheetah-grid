const webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'test/**/*.spec.js'
    ],

    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig({}, {mode: 'development', test: true}),

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text' }
      ]
    },

    browsers: ['Chrome'],
    customLaunchers: {
      'Chrome_travis_ci': {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  })
}
