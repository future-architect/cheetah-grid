// Karma configuration
// Generated on Thu Jan 19 2017 10:39:28 GMT+0900 (東京 (標準時))
'use strict';
let mintarget = false;
process.argv.forEach((val) => {
	if (val === '--min') {
		mintarget = true;
	}
});
module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],


		// list of files / patterns to load in the browser
		files: [
			require.resolve('promise-polyfills'),
			require.resolve('image-matcher'),
			'src/test/specs/test-helper.js',
			mintarget ? 'dist/cheetahGrid.es5.min.js' : 'dist/cheetahGrid.es5.js',
			'src/test/specs/*_spec.js',
			'src/test/specs/**/*_spec.js',
		],


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'dist/*.js': ['coverage'],
			'src/test/**/*.js': ['babel'],
		},

		//karma-babel-preprocessor
		babelPreprocessor: {
			options: {
				presets: ['@babel/env'],
				sourceMap: 'inline'
			},
			filename(file) {
				return file.originalPath.replace(/\.js$/, '.es5.js');
			},
			sourceFileName(file) {
				return file.originalPath;
			}
		},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['html', 'mocha', 'coverage', 'junit', 'karma-remap-istanbul'],
		htmlReporter: {
			outputFile: 'report/units.html',
			pageTitle: 'Unit Tests',
			subPageTitle: 'A sample project description',
			groupSuites: true,
			useCompactStyle: true,
			useLegacyStyle: true
		},
		// optionally, configure the reporter
		coverageReporter: {
			dir: 'coverage/dist',
			reporters: [
				{
					type: 'html'
				},
				{ // jenkins xml
					type: 'cobertura',
					file: 'cobertura.xml'
				},
			]
		},
		remapIstanbulReporter: {
			remapOptions: {}, //additional remap options
			reportOptions: {}, //additional report options
			reports: {
				lcovonly: 'coverage/remap/lcov/lcov.info',
				html: 'coverage/remap/html',
				cobertura: 'coverage/remap/cobertura/cobertura.xml'
			}
		},
		junitReporter: {
			outputDir: 'report'
		},


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_DEBUG,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		// browsers: ['Chrome', 'Firefox', 'IE'],
		browsers: ['Chrome', 'IE_no_addons'],
		customLaunchers: {
			'IE_no_addons': {
				base: 'IE',
				flags: ['-extoff']
			},
			'ChromeHeadless_custom': {
				base: 'ChromeHeadless',
				flags: ['--enable-logging', '--v=2']
			},
			'Chrome_travis_ci': {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox']
			},
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};
