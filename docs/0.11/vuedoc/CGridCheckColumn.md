# c-grid-check-column 

@mixin column-mixin 

- **mixin** - column-mixin 
- **mixin** - std-column-mixin 

## slots 

- `default` 

## props 

- `caption` ***String*** (*optional*) `default: ''` 

  Defines a header caption 

- `sort` ***String|Function|Boolean*** (*optional*) `default: undefined` 

  Defines a sort 

- `header-style` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a column header style 

- `header-field` ***String*** (*optional*) `default: undefined` 

  Defines a column header data field 

- `header-type` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a column header type 

- `header-action` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a column header action 

- `field` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a column data field 

- `filter` ***String|Function*** (*optional*) `default: undefined` 

  Defines a vue filter name 

- `width` ***Number|String*** (*optional*) `default: undefined` 

  Defines a default column width 

- `min-width` ***Number|String*** (*optional*) `default: undefined` 

  Defines a column min width 

- `max-width` ***Number|String*** (*optional*) `default: undefined` 

  Defines a column max width 

- `column-style` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a column style 

- `icon` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines an icon 

- `message` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a Message generation method 

- `disabled` ***Boolean*** (*optional*) 

  Defines disabled 

- `readonly` ***Boolean*** (*optional*) 

  Defines readonly 

## methods 

- `invalidate()` 

  Redraws the whole grid. 

   **return value:** 

     - **Any** - {void} 
