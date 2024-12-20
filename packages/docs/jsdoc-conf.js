'use strict'

module.exports = {
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure']
  },
  source: {
    include: [
    ],
    exclude: [
    ],
    includePattern: '.+\\.js(doc|x)?$',
    excludePattern: '(^|\\/|\\\\)_'
  },
  plugins: [],
  templates: {
    cleverLinks: false,
    monospaceLinks: false,
    default: {
      includeDate: false
    }
  },
  opts: {
    encoding: 'utf8',
    destination: '../../docs/documents/jsdoc/',
    recurse: true,
    readme: '../../README.md'
  }
}
