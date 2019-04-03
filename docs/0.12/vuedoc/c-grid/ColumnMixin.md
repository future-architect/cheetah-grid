# column-mixin 

The Mixin for `<c-grid-column>` components. 

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

## methods 

- `invalidate()` 

  Redraws the whole grid. 

   **return value:** 

     - **Any** - {void} 
