// @ts-check
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOC_ROOT = path.resolve(__dirname, '../../')

/**
 * @typedef {import('vitepress').DefaultTheme.SidebarItem} VitepressSidebarItem
 * @typedef { Record<string, SidebarItem[]> } SidebarMulti
 */
/**
 * @typedef {object} SidebarItem
 * @property {string} text
 * @property {string} [link]
 * @property {SidebarItem[]} [items]
 * @property {boolean} [collapsable]
 */
/**
 * @typedef {object} ExtractedLinks
 * @property {number} count
 * @property {SidebarMulti} items
 * @property {SidebarItem|null} index
 */
/**
 * @param {string} parent root directory
 * @param {object} [options]
 * @returns {ExtractedLinks} SidebarMulti
 */
export function extractLinks (parent = '/', options = {}) {
  return extractSubLinks(parent, { ...options, ignoreFiles: ['/index.md'] })
}
/**
 * @param {string} parent root directory
 * @param {object} options
 * @param {string[]} [options.ignoreFiles]
 * @returns {ExtractedLinks} SidebarMulti
 */
function extractSubLinks (parent = '/', options) {
  const ignoreFiles = options.ignoreFiles ?? []
  let count = 0

  /** @type {SidebarMulti} */
  const result = {
    [parent]: []
  }

  const items = new (class Items {
    push (item) {
      for (const items of Object.values(result)) {
        items.push(item)
      }
    }

    get mainItems () {
      return result[parent]
    }
  })()

  /** @type {SidebarItem|null} */
  let indexItem = null

  for (const entry of readdir(parent)) {
    if (entry.type === 'file' && !ignoreFiles.includes(entry.path)) {
      const md = parseMarkdown(entry.filePath)
      const item = {
        text: md.title,
        link: entry.link,
        entry
      }
      items.push(item)
      if (entry.isIndex) {
        indexItem = item
      }
      count++
    } else if (entry.type === 'dir') {
      const childLinks = extractSubLinks(entry.path, options)
      if (childLinks.count) {
        const beforeLinks = [...items.mainItems]
        if (childLinks.index) {
          // 子ディレクトリにindex.mdがある場合は、親ディレクトリのリンクにそれを追加します。
          items.push(childLinks.index)
        }
        if (childLinks.count > 1) {
          // 子メニューが複数ある場合、
          // 子Path用のメニューに親を追加し、
          // resultにデータをマージします。
          for (const [key, childItems] of Object.entries(childLinks.items)) {
            result[key] = [
              ...beforeLinks,
              {
                text: childLinks.index?.text ?? entry.name,
                collapsable: false,
                items: childItems
              }
            ]
          }
        }
        count += childLinks.count
      }
    }
  }

  return {
    count,
    items: Object.fromEntries(
      Object.entries(result).filter(([, items]) => items.length > 0)
    ),
    index: indexItem
  }
}

/**
 * @typedef {object} DirEntry
 * @property {"dir"} type
 * @property {string} path
 * @property {string} name
 * @property {string} id
 */
/**
 * @typedef {object} MdEntry
 * @property {"file"} type
 * @property {string} path
 * @property {string} name
 * @property {string} id
 * @property {string} filePath
 * @property {string} link
 * @property {boolean} isIndex
 */
/**
 * @typedef {DirEntry|MdEntry} Entry
 */
/**
 * @param {string} parent
 * @returns {Entry[]}
 */
function readdir (parent) {
  const searchPath = path.resolve(DOC_ROOT, `.${parent}`)
  return fs
    .readdirSync(searchPath, { withFileTypes: true })
    .map((dirent) => {
      if (dirent.isDirectory()) {
        if (dirent.name === 'node_modules' || dirent.name.startsWith('.')) {
          return null
        }
        return {
          type: /** @type {const} */ ('dir'),
          path: `${parent}${dirent.name}/`,
          name: dirent.name,
          id: dirent.name
        }
      }
      if (path.extname(dirent.name) !== '.md') {
        return null
      }
      const isIndex = dirent.name === 'index.md'
      return {
        type: /** @type {const} */ ('file'),
        isIndex,
        filePath: path.join(searchPath, dirent.name),
        path: `${parent}${dirent.name}`,
        link: isIndex
          ? parent
          : `${parent}${path.basename(dirent.name, '.md')}.html`,
        name: dirent.name,
        id: isIndex ? '' : dirent.name
      }
    })
    .filter((entry) => entry != null)
    .sort(compareEntry)
}

/**
 * @typedef {object} ParsedMarkdown
 * @property {string} title
 * @property {object} frontmatter
 * @property {boolean} frontmatter.forExternal
 *
 */
/**
 *
 * @param {string} filePath
 * @returns {ParsedMarkdown}
 */

function parseMarkdown (filePath) {
  /** @type {ParsedMarkdown} */
  const result = {
    title: '',
    frontmatter: { forExternal: true }
  }
  const contents = fs.readFileSync(filePath, 'utf8')
  let markdownContents = contents
  const frontmatterMatch = /^---([\s\S]+?)---/u.exec(contents)
  if (frontmatterMatch) {
    // eslint-disable-next-line prefer-destructuring
    const frontmatter = frontmatterMatch[1]
    const title = /(?:^|\n)title\s*:\s*([^\n]+)\s*\n/u.exec(frontmatter)
    if (title) {
      // eslint-disable-next-line prefer-destructuring
      result.title = title[1]
    }
    if (/(?:^|\n)forExternal\s*:\s*false\s*\n/u.test(frontmatter)) {
      result.frontmatter.forExternal = false
    }
    markdownContents = contents.slice(frontmatterMatch[0].length)
  }
  if (!result.title) {
    const h1Match = /(?:^|\n)#\s+([^\n]+)\n/u.exec(markdownContents)
    if (h1Match) {
      // eslint-disable-next-line prefer-destructuring
      const title = h1Match[1]
      result.title = title
        .replace(/`[^`]*`|\\.|<[^>]+>/gu, (m) => {
          if (m.startsWith('<')) return ''
          const base = m.startsWith('\\') // escape
            ? m.slice(1)
            : m.slice(1, -1)
          return base.replace(/</gu, '&lt;').replace(/>/gu, '&gt;')
        })
        .trim()
    }
  }

  return result
}

/**
 * Compare file Entry
 * @param {Entry} a element 1
 * @param {Entry} b element 2
 * @returns {1|-1|0} result
 */
function compareEntry (a, b) {
  return (
    compare(getOrderFromEntry(a), getOrderFromEntry(b)) ||
    compare(a.path, b.path)
  )
}
/**
 * Compare a and b
 * @param {string|number|undefined} a
 * @param {string|number|undefined} b
 * @returns {1|-1|0} result
 */
function compare (a, b) {
  if (a == null) return -1
  if (b == null) return 1
  return a > b ? 1 : a < b ? -1 : 0
}

/**
 * @param {Entry} entry
 */
function getOrderFromEntry (entry) {
  if (entry.type === 'file' && entry.isIndex) {
    return -Infinity
  }
  if (entry.type === 'dir') {
    const filePath = path.join(DOC_ROOT, entry.path, 'index.md')
    if (fs.existsSync(filePath)) {
      return getOrder(filePath)
    }
    return Infinity
  }
  return getOrder(entry.filePath)
}

function getOrder (filePath) {
  const contents = fs.readFileSync(filePath, 'utf8')
  let r = /^---([\s\S]+?)---/g.exec(contents)
  if (r) {
    r = /order\s*:\s*(\d+)\s*\n/g.exec(r[1])
    if (r) {
      return Number(r[1])
    }
  }
  return Infinity
}
