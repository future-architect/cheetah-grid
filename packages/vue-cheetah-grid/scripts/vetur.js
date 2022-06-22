const fs = require('fs')
const path = require('path')
const { getAllVueComponentMetadata, getPropType } = require('./lib/metadata')

async function main () {
  const allMetadata = await getAllVueComponentMetadata()

  const tags = {}
  const attributes = {}

  for (const { component, componentName, filename } of Object.values(allMetadata)) {
    if (filename.includes('/c-grid/')) continue
    setTagDescription(component.name, component.description)
    setTagDescription(componentName, component.description)
    addTagProps(component.name, component.props)
    addTagProps(componentName, component.props)
  }

  const veturPath = path.resolve(path.join(__dirname, '../vetur'))
  if (!fs.existsSync(veturPath)) {
    fs.mkdirSync(veturPath)
  }
  fs.writeFileSync(path.join(veturPath, 'tags.json'), JSON.stringify(tags, null, 2))
  fs.writeFileSync(path.join(veturPath, 'attributes.json'), JSON.stringify(attributes, null, 2))

  /**
   * @param {string} tag
   * @param {import('./lib/metadata').ComponentPropMetadata[]} props
   */
  function addTagProps (tag, props) {
    const tagData = tags[tag] || (tags[tag] = {})
    const attributes = new Set(tagData.attributes || [])
    for (const prop of props) {
      if (attributes.has(prop.name)) {
        continue
      }
      attributes.add(prop.name)
      addAttrProps(tag, prop)
    }

    tagData.attributes = [...attributes]
  }
  /**
   * @param {string} tag
   * @param {import('./lib/metadata').ComponentPropMetadata} prop
   */
  function addAttrProps (tag, prop) {
    const key = `${tag}/${prop.name}`
    const attr = attributes[key] || (attributes[key] = {})
    const type = getPropType(prop)
    attr.type = (Array.isArray(type) ? type.join('|') : type)
      .replace('Number', 'number')
      .replace('String', 'string')
      .replace('Boolean', 'boolean')
      .replace('Object', 'object')
    attr.description = prop.description
  }
  /**
   * @param {string} tag
   * @param {string} description
   */
  function setTagDescription (tag, description) {
    const tagData = tags[tag] || (tags[tag] = {})
    tagData.description = description
  }
}

main()
