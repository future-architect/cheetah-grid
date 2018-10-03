# Cheetah Grid Dosuments Builder

Builds Cheetah Grid documentation using `metalsmith`, `handlebars`, `jsdoc` and `vuedoc`.

## Build commands

- `npm run build` builds documentation.  
    it is output to path of `../../docs/{version}`
- `npm run watch` builds documentation on each file change.  
    it is output to path of `../../docs/.devdoc`
- `npm run build:dev` builds documentation.  
    it is output to path of `../../docs/.devdoc`

## Write a handlebars file

Please write it in the file within the path of `./src`.  
The extension is `.html.hbs`.

### handlebars custom helpers

The following custom helpers are available.  
Refer to `./scripts/handlebars/helpers.js` for each implementation.

#### {{#copy varName}}

Copy the contents and store it in the variable.

#### {{#var varName}}

Stores a value in a variable.

#### {{#marked}}

Convert markdown contents to html.

#### {{#babel}}

Convert the contents of the script to ES5.

#### {{#vue}}

Convert the contents of the vue(SFC) to ES5.

#### {{#highlightjs}}

Convert the contents to the syntax highlighted html.

#### {{#wrapscript}}

Wrap the contents of the script.  
Furthermore, it converts the contents of the script to ES5.

```hbs
{{#wrapscript}}
const a = () => {}
{{/wrapscript}}
```

↓

```js
(function() {
  var a = (function() {}).bind(this)
})()
```

#### {{#code class=}}

Embed arguments as syntax highlight html.

#### {{#if_v version}}

If currently active version, output contents.

#### {{#texttrim}}

Trim the text.

#### {{concat ...args}}

Concatenate all arguments.

#### {{or ...args}}

Returns the first truthy argument.

#### {{#range start end}}

Iterate over the given range of integers.

#### {{#tree_each obj childProp}}

Iterate through the tree structure.

#### {{#eval varName}}

Evaluate the script.

#### ~~{{eq ...args}}~~

Checks that all arguments equals.

#### ~~{{lookups obj ...paths}}~~

Gets the value at path of object.

#### ~~{{includes str target}}~~

Call `includes` function.

#### ~~{{#json varName}}~~

Parse json and store it in a variable.

#### ~~{{#remove}}~~

#### ~~{{#hbs}}~~

### handlebars partials

The following partials are available.  
Refer to `./hbs/partials` for each implementation.

#### {{> code class= code=}}

Partial of the syntax highlight.

#### {{> script code=}}

Partial of the `<script>`.

### handlebars variables

The following variables are available.

#### lang_ja

`true` if Japanese document generation mode.
