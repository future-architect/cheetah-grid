'use strict';
const {cloneDeep} = require('lodash');
const path = require('path');

module.exports = function({defaultLang = 'en', locales = ['ja']} = {}) {

	const allLangs = [
		{
			lang: defaultLang,
			langDir: '',
		},
		...locales.map((lang) => ({
			lang,
			langDir: lang + '/',
		}))
	];

	return (files, metalsmith, done) => {

		
		/**
		 * Find the files in each collection.
		 */
		Object.keys(files).filter((file) => path.extname(file) === '.hbs').forEach((file) => {
			const data = files[file];
			data.allLangs = allLangs;

			allLangs.forEach(({lang, langDir}) => {
				const newName = path.join(langDir, file);
				const newData = cloneDeep(data, (value) => {
					if (value instanceof Buffer) {
						return new Buffer(value);
					}
					return value;
				});
				newData['lang_' + lang] = true;
				newData.lang = lang;
				newData.langDir = langDir;
				newData.originalPath = file.replace(/\\/g, '/');
				files[newName] = newData;
			});
		});

		done();
	};
};

