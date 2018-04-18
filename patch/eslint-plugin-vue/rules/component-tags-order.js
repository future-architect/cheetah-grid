/**
 * @author Yosuke Ota
 * issue https://github.com/vuejs/eslint-plugin-vue/issues/140
 */
'use strict'
const utils = require('../utils')

const DEFAULT_ORDER = Object.freeze(['script', 'template', 'style'])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

function * iterateTopLevelHTMLTagOpenFromTokens (tokens) {
  const stack = []
  for (const token of tokens) {
    switch (token.type) {
      case 'HTMLTagOpen':
        if (stack.length === 0) {
          yield token
        }
        stack.push(token.value)
        break
      case 'HTMLSelfClosingTagClose':
        stack.pop()
        break
      case 'HTMLEndTagOpen':
        const index = stack.lastIndexOf(token.value)
        if (index >= 0) {
          stack.length = index
        }
        break
    }
  }
}

function create (context) {
  const tokenStore = context.parserServices.getTemplateBodyTokenStore && context.parserServices.getTemplateBodyTokenStore()
  const order = context.options[0] && context.options[0].order || DEFAULT_ORDER

  function * iterateTopLevelHTMLTagOpen (node) {
    const templateBody = node.templateBody
    if (templateBody) {
      const tokens = templateBody.tokens
      const templateOpen = tokenStore.getFirstToken(templateBody.startTag)
      const templateClose = tokenStore.getLastToken(templateBody.endTag)

      const templateBeforeTokens = tokens.slice(0, tokens.indexOf(templateOpen))
      yield * iterateTopLevelHTMLTagOpenFromTokens(templateBeforeTokens)
      yield templateOpen
      const templateAfterTokens = tokens.slice(tokens.indexOf(templateClose))
      yield * iterateTopLevelHTMLTagOpenFromTokens(templateAfterTokens)
    } else {
      // can not analyze
    }
  }

  function report (token, firstUnorderedToken) {
    context.report({
      node: token,
      loc: token.loc,
      message: `<{{tagName}}> should be above the <{{firstUnorderedTagName}}> on line {{line}}.`,
      data: {
        tagName: token.value,
        firstUnorderedTagName: firstUnorderedToken.value,
        line: firstUnorderedToken.loc.start.line
      }
    })
  }

  return {
    Program (node) {
      const hasInvalidEOF = utils.hasInvalidEOF(node)
      if (hasInvalidEOF) {
        return
      }
      const tags = Array.from(iterateTopLevelHTMLTagOpen(node))

      tags.forEach((tag, i) => {
        const index = order.indexOf(tag.value)
        if (index < 0) {
          return
        }
        const firstUnordered = tags.slice(0, i)
          .filter(p => index < order.indexOf(p.value))
          .sort((p1, p2) => order.indexOf(p1.value) > order.indexOf(p2.value))[0]
        if (firstUnordered) {
          report(tag, firstUnordered)
        }
      })
    }
  }
}

module.exports = {
  meta: {
    docs: {
      description: 'enforce order of component top-level element',
      category: undefined
    },
    fixable: null,
    schema: {
      type: 'array',
      properties: {
        order: {
          type: 'array'
        }
      }
    }
  },
  create
}