# CheetahGrid for React

[![npm version](https://badge.fury.io/js/react-cheetah-grid.svg)](https://badge.fury.io/js/react-cheetah-grid)

React wrapper of ultra speed table component - [CheetahGrid](https://future-architect.github.io/cheetah-grid/#/)

![screenshot](https://raw.githubusercontent.com/future-architect/cheetah-grid/master/packages/react-cheetah-grid/doc/basic.png)

```tsx
type Record = {
  personid: number;
  fname: string;
  lname: string;
  email: string;
};

const records: Record[] = [
  {
    personid: 1,
    fname: "Sophia",
    lname: "Hill",
    email: "sophia_hill@example.com",
  },
  {
    personid: 2,
    fname: "Aubrey",
    lname: "Martin",
    email: "aubrey_martin@example.com",
  },
  :
];

      <CheetahGrid
        style={{ flexGrow: 1 }}
        data={records}
        theme={"BASIC"}
      >
        <Column field="personid" width={50}>
          ID
        </Column>
        <Column field="fname" width={100}>
          First Name
        </Column>
        <Column field="lname" width={100}>
          Last Name
        </Column>
        <Column field="email" width={300}>
          E-Mail
        </Column>
      </CheetahGrid>
```

## Table

### Attributes

- `style`: CSS style to specify table size

```ts
{
  width: string | number;
  height: string | number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: number;
}
```

- `children`: Child components (columns, layouts)
- `frozenColCount: number`: Fix column count
- `defaultRowHeight: number`: Default row height
- `headerRowHeight: number`: Header row height
- `theme: ThemeDefine | string`

Theme is described at [here](https://future-architect.github.io/cheetah-grid/documents/api/js/theme.html#grid-instance). You can use custom theme or preset theme(`MATERIAL_DESIGN`(default), `BASIC`)

### Data Sources

`data` props is required to accept data source.
One of the following props are required.

- `data`: Array data of table or `DataSource` instance to supply table data to CheetahGrid. This is described at [here](https://future-architect.github.io/cheetah-grid/documents/api/js/grid_data/#using-cheetahgrid-data-datasource-object).

If you modify records data directly out side of `<CheetahGrid>` (for example, modify data from event handlers), call its instance's `invalidate()` method.

## Column Types

![Columns](https://raw.githubusercontent.com/future-architect/cheetah-grid/master/packages/react-cheetah-grid/doc/columns.png)

Supported column types:

- `<Column>`
- `<NumberColumn>`
- `<MultilineTextColumn>`
- `<ImageColumn>`
- `<IconColumn>`
- `<ButtonColumn>`
- `<CheckColumn>`
- `<RadioColumn>`
- `<MenuColumn>`
- `<PercentCompleteBarColumn>`
- `<BranchGraphColumn>`

### Basic Column Props

- `width: number or string`:
- `minWidth: number or string`:
- `maxWidth: number or string`:
- `field: string`: Object's key to show in this column.
- `style`: Column's style. This is described at [here](https://future-architect.github.io/cheetah-grid/documents/api/js/column_styles.html#standard-column-style).

Some column type supports extra props:

- `<NumberColumn>`
  - `format`: `Intl.NumberFormat` to specify number's format
- `<IconColumn>`
  - `content`: The content to show repeatedly
- `<ButtonColumn>`
  - `buttonCaption: string`: Button's caption text
  - `buttonBgColor: string`: Background color
- `<MenuColumn>`
  - `options: {label: string; value: any }[]`: Menu's value option
  - `menuOptions: {label: string; value: any }[]`: Menu's option
- `<PercentCompleteBarColumn>`
  - `formatter: (v: string) => string`: Label format function
  - `min: number, max: number`: Specify data range to show in the cell
- `<BranchGraphColumn>` [detial](https://future-architect.github.io/cheetah-grid/documents/api/js/column_types/BranchGraphColumn.html#constructor-properties)
  - `start: "top" or "bottom"`
  - `cache: boolean`

### Column's Interactions (events, edit data)

To enable editing, add `editable` to column. `editable` and `onClick` event are exclusive.

| Column Type                                      | `editable`                              | `onClick: (row: T) => void` | `disabled` |
| :----------------------------------------------- | :-------------------------------------- | :-------------------------- | :--------- |
| `<CheckColumn>`, `<RadioColumn>`, `<MenuColumn>` | ✔︎                                      | ✔︎                          | ✔          |
| `<Column>`, `<NumberColumn>`, `<IconColumn>`     | `true/false` or `"inline"` or `"popup"` | ✔︎                          | ✔          |
| `<ButtonColumn>`                                 |                                         | ✔︎ (required)               | ✔          |
| Other columns                                    |                                         | ✔︎                          | ✔︎         |

```tsx
{ /* Sample */ }
<CheckColumn field="selected" editable>Check<CheckColumn>
<CheckColumn field="selected" onClick={(rec: Record) => { alert(`Data is ${JSON.stringify(rec)}`)} }>Check<CheckColumn>
<Column field="name" editable>Name (editable with inline editor)<CheckColumn>
<Column field="name" editable="inline">Name (editable with inline editor too)<CheckColumn>
<Column field="name" editable="popup">Name (editable with popup editor)<CheckColumn>
<ButtonColumn onClick={(rec: Record) => { alert(`Data is ${JSON.stringify(rec)}`)}>See Content</ButtonColumn>
{ /* Errors: You can't use both 'editable' and 'onClick' at the same time */}
<CheckColumn field="selected" editable onClick={(rec: Record) => { alert(`Data is ${JSON.stringify(rec)}`)} }>Check<CheckColumn>
{ /* Errors: ButtonColumn requires onClick */ }
<ButtonColumn>No Action</ButtonColumn>
```

## `<CheetahGrid>`'s events

`<CheetahGrid>` has the following events:

- `onCellClick: (e: MouseCellEvent) => void`
- `onCellDoubleClick: (e: MouseCellEvent) => void`
- `onCellDoubleTap: (e: TouchCellEvent) => void`
- `onCellMouseDown: (e: MouseCellEvent) => void`
- `onCellMouseUp: (e: MouseCellEvent) => void`
- `onCellSelect: (e: SelectedCellEvent) => void`
- `onKeyDown: (e: KeydownEvent) => void`
- `onCellMouseMove: (e: MouseCellEvent) => void`
- `onCellMouseEnter: (e: MousePointerCellEvent) => void`
- `onCellMouseLeave: (e: MousePointerCellEvent) => void`
- `onCellMouseOver: (e: MousePointerCellEvent) => void`
- `onCellMouseOut: (e: MousePointerCellEvent) => void`
- `onCellInput: (e: InputCellEvent) => void`
- `onCellPaste: (e: PasteCellEvent) => void`
- `onCellContextMenu: (e: MouseCellEvent) => void`
- `onColumnResize: (e: ColumnResizeEvent) => void`
- `onScroll: (e: ScrollEvent) => void`
- `onCellEditableInput: (e: CellAddress) => boolean or void`
- `onModifyStatusEditableInput: (e: ModifyStatusEditableinputCellEvent) => void`
- `onValueChange: (e: ChangedValueCellEvent<T>) => void`
- `onHeaderValueChange: (e: ChangedHeaderValueCellEvent) => void`
- `onFocus: (e: FocusEvent) => void`
- `onBlur: (e: FocusEvent) => void`

## Advanced Features

### Access CheetahGrid's internal state

- `CheetahGrid.props.instance`: `ref` object to access CheetahGrid instance features:

Now there are few features:

- `selection` attribute: Get current selection information
- `invalidate()` method: Trigger redraw after changing internal data

```tsx
import {
  CheetahGrid,
  useCheetahGridInstance,
  Column,
} from "react-cheetah-grid";
import {
  useCallback
} from "react";

function App() {
  const [instance, instanceRef] = useCheetahGridInstance();
  const onClick = useCallback(() => {
    // Access cheetah-grid's instance attribute/method via instanceRef
    alert(`Select: ${JSON.stringify(instance.selection)}`);
  }, [instance]);
  return (
    <>
      <button>
      <CheetahGrid data={props.records} instance={instanceRef}>
        <Column field="id">ID</Column>
        <Column field="name">Name</Column>
      </CheetahGrid>
    </>
  );
}
```

### Cell Message

![Message sample](https://raw.githubusercontent.com/future-architect/cheetah-grid/master/packages/react-cheetah-grid/doc/message.png)

`message` props adds message to cells.

- `string`: Fields name of record.
- `function`: Run logic to specify warning message.

The function can return object. It includes message and severity.

```tsx
<Column field={"text1"} width={150} message="msg">
  Msg from data
</Column>
<Column
  field={"text2"}
  width={150}
  editable
  message={(rec) => {
    return rec.text2.match(/^[a-zA-Z]*$/)
      ? null
      : "Please only alphabet.";
  }}
>
  Alphabet Check
</Column>
```

The function can return object instead of string. `"error"`, `"warning"`, `"info"` are supported as a type:

```js
(rec) => {
  return {
    type: "warning",
    message: "Warning Message.",
  };
};
```

### Sort

![Sort sample](https://raw.githubusercontent.com/future-architect/cheetah-grid/master/packages/react-cheetah-grid/doc/sort.png)

`sort` props add sorting feature. Just add `sort` props enables sorting feature that uses JavaScript standard comparison. Also you can specify sort function as well.

```tsx
<Column
  width={40}
  sort={(order, col, grid) => {
    const compare =
      order === "desc"
        ? (v1: number, v2: number) =>
            v1 === v2 ? 0 : v1 > v2 ? 1 : -1
        : (v1: number, v2: number) =>
            v1 === v2 ? 0 : v1 < v2 ? 1 : -1;
    records.sort((r1, r2) => compare(r1.personid, r2.personid));
    console.log("sorted:", records);
    grid.data = records;
  }}
  field="personid"
>
  ID
</Column>
<Column field="name" sort>Name</Column>
```

More detail information is [here](https://future-architect.github.io/cheetah-grid/documents/api/js/advanced_header/column_sort.html#color-of-sort-arrow).

### Header Type and Action

![screenshot](https://raw.githubusercontent.com/future-architect/cheetah-grid/master/packages/react-cheetah-grid/doc/headeraction.png)

You can customize header types and actions in addition to body cells types and actions.

`headerType` can accept the following values:

- `sort`
- `check`
- `multilinetext`.

`headerAction` can accept the following values:

- `sort`
- `check`

```tsx
const [instance, instanceRef] = useCheetahGridInstance();
const onChangeHeaderValue = useCallback(
  (v: ChangedHeaderValueCellEvent) => {
    console.log(v);
    for (const record of records) {
      record.check = v.value;
    }
    instance?.invalidate();
  },
  [instance]
);

<CheetahGrid
  instance={instanceRef}
  style={{ flexGrow: 1 }}
  data={records}
  frozenColCount={2}
  onHeaderValueChange={onChangeHeaderValue}
>
  <Column width={60} headerType="multilinetext" field="name_and_org">
    {"Name and\nOrganization"}
  </Column>
  <Check headerType="check" headerAction="check" field="check"></Check>
</CheetahGrid>;
```

### Complex Layout

![screenshot](https://raw.githubusercontent.com/future-architect/cheetah-grid/master/packages/react-cheetah-grid/doc/layout.png)

It supports complex layout like multi row headers and bodies.

If header and body's cells have different structure, use the following components:

- `<HeaderLayout>`
- `<BodyLayout>`

Under the `<HeaderLayout>`, use `<Header>` component instead of column's components. `<Header>` is a simple version of column components that supports only `width` related props and `sort`, header type's and header actions's props.

The `<Line>` component enables to support multi row header and body. `rowSpan` and `colSpan` props of `<Header>` and columns components to control layout.

-

```tsx
<CheetahGrid
  style={{ flexGrow: 1 }}
  data={records}
  frozenColCount={2}
  theme={"BASIC"}
>
  <HeaderLayout>
    <Line>
      <Header width={40} rowSpan={2}>
        ID
      </Header>
      <Header width={60} rowSpan={2}>
        Check
      </Header>
      <Header colSpan={2}>Name</Header>
      <Header rowSpan={2} width={280}>
        Email
      </Header>
      <Header rowSpan={2}>Fav</Header>
    </Line>
    <Line>
      <Header width={200}>First Name</Header>
      <Header width={200}>Last Name</Header>
    </Line>
  </HeaderLayout>
  <BodyLayout>
    <Column field={"personid"} />
    <CheckColumn field={"check"} />
    <Column field={"fname"} />
    <Column field={"lname"} />
    <Column field={"email"} />
    <ButtonColumn
      onClick={(data: Record) => {
        alert(`click: ${data.personid}`);
      }}
      buttonCaption="Fav💖"
    ></ButtonColumn>
  </BodyLayout>
</CheetahGrid>
```

## License

MIT License

## Contribution

How to run and build:

```bash
# launch dev server
$ npm run dev

# test
$ npm test

# build
$ npm run build
```
