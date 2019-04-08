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

function readFile (menu) {
  let f = path.resolve(DOC_ROOT, `.${menu}`)
  if (isDirectory(f)) {
    f += '/README.md'
  } else {
    f += '.md'
  }
  return fs.readFileSync(f, 'utf8')
}

function getOrder (menu) {
  const contents = readFile(menu)
  let r = /^---([\s\S]+?)---/g.exec(contents)
  if (r) {
    r = /order\s*:\s*(\d+)\s*\n/g.exec(r[1])
    if (r) {
      return r[1] - 0
    }
  }
  return null
}

function inferTitle (menu) {
  const contents = readFile(menu)
  let r = /^---([\s\S]+?)---/g.exec(contents)
  if (r) {
    r = /title\s*:\s*(.+)\s*\n/g.exec(r[1])
    if (r) {
      return r[1]
    }
  }
  r = /^#\s+(.+?)\n/g.exec(contents)
  if (r) {
    return r[1]
  }
  r = /\n#\s+(.+?)\n/g.exec(contents)
  if (r) {
    return r[1]
  }
  return null
}

module.exports = {
  inferTitle,
  compare (a, b) {
    if (a.endsWith('/') && b.startsWith(a)) {
      return -1
    }
    if (b.endsWith('/') && a.startsWith(b)) {
      return 1
    }
    const oa = getOrder(a)
    const ob = getOrder(b)
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
