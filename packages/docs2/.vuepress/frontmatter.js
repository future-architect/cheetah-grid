'use strict'

const fs = require('fs')
const path = require('path')
const DOC_ROOT = path.resolve(__dirname, '../')

function isDirectory (f) {
  try {
    return fs.statSync(f).isDirectory()
  } catch (e) {
    return false
  }
}

function getOrder (f) {
  if (isDirectory(f)) {
    f += '/README.md'
  } else {
    f += '.md'
  }
  const context = fs.readFileSync(f, 'utf8')
  let r = /---([\s\S]+?)---/g.exec(context)
  if (r) {
    r = /order\s*:\s*(\d+)\s*\n/g.exec(r[1])
    if (r) {
      return r[1] - 0
    }
  }
  return null
}

module.exports = {
  compare (a, b) {
    if (a.endsWith('/') && b.startsWith(a)) {
      return -1
    }
    if (b.endsWith('/') && a.startsWith(b)) {
      return 1
    }
    const oa = getOrder(path.resolve(DOC_ROOT, `.${a}`))
    const ob = getOrder(path.resolve(DOC_ROOT, `.${b}`))
    if (oa == null && ob == null) {
      return a > b ? 1 : a < b ? -1 : 0
    }
    if (oa == null) {
      return 1
    }
    if (ob == null) {
      return -1
    }
    return oa > ob ? 1 : oa < ob ? -1 : 0
  }
}
