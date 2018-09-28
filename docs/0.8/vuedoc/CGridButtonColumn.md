# c-grid-button-column 

@mixin column-mixin 

- **mixin** - column-mixin 
- **mixin** - std-column-mixin 

## slots 

- `default` 

## props 

- `sort` ***String|Function|Boolean*** (*optional*) `default: undefined` 

  Defines a sort 

- `header-style` ***Object|String|Function*** (*optional*) `default: undefined` 

  Defines a column header style 

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

- `caption` ***String*** (*optional*) `default: ''` 

  Defines a button caption 

- `disabled` ***Boolean*** (*optional*) 

  Defines disabled 

## events 

- `click` 

  Fired when a click on cell. 

## methods 

- `invalidate()` 

  Redraws the whole grid. 

   **return value:** 

     - **Any** - {void} 
