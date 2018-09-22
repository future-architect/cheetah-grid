'use strict'

const conf = Object.assign({}, require('../../eslint/eslint-config.js'))

conf.overrides= [
  {
    "files": ["*.hbs"],
    "parserOptions": {
      "sourceType": "module"
    }
  }
]

module.exports = conf