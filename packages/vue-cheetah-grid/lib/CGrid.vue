<template>
  <div class="c-grid">
    <div class="define">
      <div
        ref="defaultSlotContainer"
      >
        <!--
          Use this slot to set the simple header definition.
          The definition is set to `header` property described in [Define Headers and Columns](https://future-architect.github.io/cheetah-grid/documents/api/js/headers_columns.html)
        -->
        <slot />
      </div>
      <div
        ref="layoutHeaderSlotContainer"
      >
        <!--
          Use this slot to set the layout header definition.
          Use this slot in combination with the `layout-body` slot.
          The definition is set to `layout.header` property described in [Advanced Layout](https://future-architect.github.io/cheetah-grid/documents/api/vue/advanced_layout/).
        -->
        <slot name="layout-header" />
      </div>
      <div
        ref="layoutBodySlotContainer"
      >
        <!--
          Use this slot to set the layout body definition.
          Use this slot in combination with the `layout-header` slot.
          The definition is set to `layout.body` property described in [Advanced Layout](https://future-architect.github.io/cheetah-grid/documents/api/vue/advanced_layout/).
        -->
        <slot name="layout-body" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  cheetahGrid,
  gridUpdateWatcher,
  extend,
  vue3Emits,
  getSlotChildren,
  hackVue3
} from './c-grid/utils'
import { slotElementsToHeaderOptions, slotElementsToHeaderProps } from './c-grid/header-utils'

const primitives = {
  function: true, string: true, number: true, boolean: true, undefined: true, bigint: true, symbol: true
}
function getKeys (o) {
  const keys = Object.keys(o)
  if (!Array.isArray(o) && Object.getOwnPropertySymbols) {
    const symbols = Object.getOwnPropertySymbols(o)
    symbols.forEach((symbol) => {
      if (Object.prototype.propertyIsEnumerable.call(o, symbol)) {
        keys.push(symbol)
      }
    })
  }
  return keys
}
function deepObjectEquals (a, b) {
  if (a === b) {
    return true
  }
  if (typeof a !== typeof b || a == null || b == null ||
    a.constructor !== b.constructor) {
    return false
  }
  if (primitives[typeof a]) {
    return false
  }
  const aKeys = getKeys(a)
  const bKeys = getKeys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  for (let i = 0; i < aKeys.length; i++) {
    const aKey = aKeys[i]
    const bKey = bKeys[i]
    if (aKey !== bKey && (bKeys.indexOf(aKey) === -1 || aKeys.indexOf(bKey) === -1)) {
      return false
    }
    if (!deepObjectEquals(a[aKey], b[aKey])) {
      return false
    }
  }
  return true
}

function _setGridData (vm, grid, data, filter) {
  const oldDataSource = grid.dataSource && grid.dataSource.dataSource
  const unusedDataSources = new Set(vm._dataSources || [])

  const dataSources = vm._dataSources = []
  let dataSource
  if (Array.isArray(data)) {
    if (filter) {
      if (oldDataSource && oldDataSource.source === data) {
        oldDataSource.length = data.length
        dataSource = oldDataSource
        unusedDataSources.delete(dataSource)
      } else {
        dataSource = cheetahGrid.data.CachedDataSource.ofArray(data)
        dataSources.push(dataSource)
      }
    } else {
      grid.records = data
      unusedDataSources.forEach(dc => dc.dispose())
      return
    }
  } else if (data instanceof cheetahGrid.data.DataSource) {
    dataSource = data
  } else {
    if (oldDataSource && oldDataSource.source === data) {
      oldDataSource.length = data.length
      dataSource = oldDataSource
      unusedDataSources.delete(dataSource)
    } else {
      dataSource = new cheetahGrid.data.CachedDataSource(data)
      dataSources.push(dataSource)
    }
  }
  if (filter) {
    if (dataSource instanceof cheetahGrid.data.FilterDataSource) {
      dataSource.filter = filter
    } else {
      dataSource = new cheetahGrid.data.FilterDataSource(dataSource, filter)
      dataSources.push(dataSource)
    }
  }
  grid.dataSource = dataSource

  unusedDataSources.forEach(dc => dc.dispose())
}
function _bindEvents (vm, grid) {
  const { EVENT_TYPE } = cheetahGrid.ListGrid
  grid.listen(EVENT_TYPE.CHANGED_HEADER_VALUE, (...args) => {
    vm.headerValues = grid.headerValues
  })
  for (const k in EVENT_TYPE) {
    const type = EVENT_TYPE[k]
    const emitType = type.replace(/_/g, '-').toLowerCase()
    grid.listen(type, (...args) => {
      const results = []

      vm.$_CGrid_emit(emitType, ...args, (r) => {
        results.push(r)
      })

      // emit column event
      const [first] = args
      const col = first && first.col != null && typeof first.col === 'number' ? first.col : null
      const row = first && first.row != null && typeof first.row === 'number' ? first.row : null

      if (col != null && row != null && grid.colCount > col) {
        const define = grid.frozenRowCount > row
          ? grid.getHeaderDefine(col, row)
          : grid.getColumnDefine(col, row)
        if (define && define.vm) {
          define.vm.$emit(emitType, ...args, (r) => {
            results.push(r)
          })
        }
      }
      if (type === EVENT_TYPE.REJECTED_PASTE_VALUES) {
        // Convert REJECTED_PASTE_VALUES event to cell event
        const detailByVm = new Map()
        for (const data of first.detail || []) {
          const define = grid.getColumnDefine(data.col, data.row)
          if (define && define.vm) {
            let detail = detailByVm.get(define.vm)
            if (!detail) {
              detail = []
              detailByVm.set(define.vm, detail)
            }
            detail.push(data)
          }
        }
        for (const [vm, detail] of detailByVm) {
          vm.$emit(emitType, { ...first, detail }, (r) => {
            results.push(r)
          })
        }
      }
      return results[0]
    })
  }
}
function _buildGridProps (vm) {
  const headerLayoutOptions = {}

  if (getSlotChildren(vm, 'layoutBodySlotContainer')) {
    if (getSlotChildren(vm, 'layoutHeaderSlotContainer')) {
      headerLayoutOptions.layout = {
        header: slotElementsToHeaderProps(vm, 'layoutHeaderSlotContainer'),
        body: slotElementsToHeaderProps(vm, 'layoutBodySlotContainer')
      }
    } else {
      headerLayoutOptions.layout = {
        header: slotElementsToHeaderProps(vm, 'layoutBodySlotContainer'),
        body: slotElementsToHeaderProps(vm, 'layoutBodySlotContainer')
      }
    }
  } else {
    headerLayoutOptions.header = slotElementsToHeaderProps(vm, 'defaultSlotContainer')
  }
  return extend(
    {
      theme: vm.theme || null
    },
    headerLayoutOptions,
    vm.options
  )
}
function _buildGridOption (vm) {
  const headerLayoutOptions = {}
  if (getSlotChildren(vm, 'layoutBodySlotContainer')) {
    if (getSlotChildren(vm, 'layoutHeaderSlotContainer')) {
      headerLayoutOptions.layout = {
        header: slotElementsToHeaderOptions(vm, 'layoutHeaderSlotContainer'),
        body: slotElementsToHeaderOptions(vm, 'layoutBodySlotContainer')
      }
    } else {
      headerLayoutOptions.layout = {
        header: slotElementsToHeaderOptions(vm, 'layoutBodySlotContainer'),
        body: slotElementsToHeaderOptions(vm, 'layoutBodySlotContainer')
      }
    }
  } else {
    headerLayoutOptions.header = slotElementsToHeaderOptions(vm, 'defaultSlotContainer')
  }
  return extend(
    {
      frozenColCount: vm.frozenColCount - 0,
      theme: vm.theme || null,
      headerRowHeight: vm.headerRowHeight,
      allowRangePaste: vm.allowRangePaste,
      trimOnPaste: vm.trimOnPaste,
      defaultRowHeight: vm.defaultRowHeight,
      defaultColWidth: vm.defaultColWidth,
      font: vm.font,
      underlayBackgroundColor: vm.underlayBackgroundColor,
      keyboardOptions: { moveCellOnTab: vm.moveCellOnTabKey, moveCellOnEnter: vm.moveCellOnEnterKey, deleteCellValueOnDel: vm.deleteCellValueOnDelKey, selectAllOnCtrlA: vm.selectAllOnCtrlAKey },
      disableColumnResize: vm.disableColumnResize
    },
    headerLayoutOptions,
    vm.options
  )
}
function _initGrid (vm) {
  vm._beforeGridProps = _buildGridProps(vm)
  const options = _buildGridOption(vm)
  options.parentElement = vm.$el
  const grid = vm.rawGrid = new cheetahGrid.ListGrid(options)
  if (vm.disabled) {
    grid.disabled = true
  }
  if (vm.readonly) {
    grid.readOnly = true
  }
  _setGridData(vm, grid, vm.data, vm.filter)
  _bindEvents(vm, grid)
}

let seq = 0

/**
 * Defines the Grid.
 */
export default {
  name: 'CGrid',
  get mixins () {
    hackVue3(this)
    return undefined
  },
  provide () {
    return {
      $_CGridInstance: this
    }
  },
  props: {
    /**
     * Defines a records or data source.
     */
    data: {
      type: [Array, Object],
      default: undefined
    },
    /**
     * Defines a frozen col Count
     */
    frozenColCount: {
      type: [Number, String],
      default: 0
    },
    /**
     * Defines the header row height(s)
     */
    headerRowHeight: {
      type: [Number, Array],
      default: undefined
    },
    /**
     * Allow pasting of range.
     */
    allowRangePaste: {
      type: Boolean
    },
    /**
     * Trim the pasted text on pasting.
     */
    trimOnPaste: {
      type: Boolean
    },
    /**
     * Default grid row height.
     */
    defaultRowHeight: {
      type: Number,
      default: undefined
    },
    /**
     * Default grid col width.
     */
    defaultColWidth: {
      type: Number,
      default: undefined
    },
    /**
     * Defines a records filter
     */
    filter: {
      type: [Function],
      default: undefined
    },
    /**
     * Default font.
     */
    font: {
      type: String,
      default: undefined
    },
    /**
     * Underlay background color.
     */
    underlayBackgroundColor: {
      type: String,
      default: undefined
    },
    /**
     * Defines the grid theme
     */
    theme: {
      type: [Object, String],
      default: undefined
    },
    /**
     * Specify `true` to enable cell movement by Tab key. You can also specify a function that determines which cell to move to.
     */
    moveCellOnTabKey: {
      type: [Boolean, Function],
      default: false
    },
    /**
     * Specify `true` to enable cell movement by Enter key. You can also specify a function that determines which cell to move to.
     */
    moveCellOnEnterKey: {
      type: [Boolean, Function],
      default: false
    },
    /**
     *  Specify `true` to enable enable deletion of cell values with the Del and BS keys.
     */
    deleteCellValueOnDelKey: {
      type: Boolean
    },
    /**
     *  Specify `true` to enable select all cells by Ctrl + A key.
     */
    selectAllOnCtrlAKey: {
      type: Boolean
    },
    /**
     * Specify `true` to disable column resizing
     */
    disableColumnResize: {
      type: Boolean
    },
    /**
     * Defines disabled
     */
    disabled: {
      type: Boolean
    },
    /**
     * Defines readonly
     */
    readonly: {
      type: Boolean
    },
    /**
     * Defines a raw options for Cheetah Grid
     */
    options: {
      type: Object,
      default: undefined
    }
  },
  emits: {
    'click-cell': null,
    'dblclick-cell': null,
    'selected-cell': null,
    'paste-cell': null,
    'changed-value': null,
    'changed-header-value': null,
    ...vue3Emits
  },
  data () {
    return {
      /**
       * Header values.
       * @type {Map<any, any>}
       */
      headerValues: new Map()
    }
  },
  computed: {
    dataLengthForWatch () {
      return (this.data && this.data.length) || 0
    }
  },
  watch: {
    data (data) {
      if (this.rawGrid) {
        _setGridData(this, this.rawGrid, data, this.filter)
      }
    },
    dataLengthForWatch () {
      if (this.rawGrid) {
        _setGridData(this, this.rawGrid, this.data, this.filter)
      }
    },
    filter (filter) {
      if (this.rawGrid) {
        _setGridData(this, this.rawGrid, this.data, filter)
      }
    },
    frozenColCount (frozenColCount) {
      if (this.rawGrid) {
        this.rawGrid.frozenColCount = frozenColCount
        this.$_CGrid_nextTickInvalidate()
      }
    },
    allowRangePaste (allowRangePaste) {
      if (this.rawGrid) {
        this.rawGrid.allowRangePaste = !!allowRangePaste
      }
    },
    trimOnPaste (trimOnPaste) {
      if (this.rawGrid) {
        this.rawGrid.trimOnPaste = !!trimOnPaste
      }
    },
    headerRowHeight (headerRowHeight) {
      if (this.rawGrid) {
        this.rawGrid.headerRowHeight = headerRowHeight
      }
    },
    defaultRowHeight (defaultRowHeight) {
      if (this.rawGrid && defaultRowHeight != null) {
        this.rawGrid.defaultRowHeight = defaultRowHeight
      }
    },
    defaultColWidth (defaultColWidth) {
      if (this.rawGrid && defaultColWidth != null) {
        this.rawGrid.defaultColWidth = defaultColWidth
      }
    },
    font (font) {
      if (this.rawGrid) {
        this.rawGrid.font = font
        this.$_CGrid_nextTickInvalidate()
      }
    },
    underlayBackgroundColor (underlayBackgroundColor) {
      if (this.rawGrid) {
        this.rawGrid.underlayBackgroundColor = underlayBackgroundColor
        this.$_CGrid_nextTickInvalidate()
      }
    },
    disableColumnResize (disableColumnResize) {
      if (this.rawGrid) {
        this.rawGrid.disableColumnResize = disableColumnResize
      }
    },
    options: gridUpdateWatcher,
    headerValues: {
      handler (headerValues) {
        this.rawGrid.headerValues = headerValues
      },
      deep: true
    },
    disabled (disabled) {
      if (this.rawGrid) {
        this.rawGrid.disabled = disabled
      }
    },
    readonly (readonly) {
      if (this.rawGrid) {
        this.rawGrid.readOnly = readonly
      }
    },
    moveCellOnTabKey (moveCellOnTab) {
      this.$_CGrid_updateKeyboardOptions({ moveCellOnTab })
    },
    moveCellOnEnterKey (moveCellOnEnter) {
      this.$_CGrid_updateKeyboardOptions({ moveCellOnEnter })
    },
    deleteCellValueOnDelKey  (deleteCellValueOnDel) {
      this.$_CGrid_updateKeyboardOptions({ deleteCellValueOnDel })
    },
    selectAllOnCtrlAKey  (selectAllOnCtrlA) {
      this.$_CGrid_updateKeyboardOptions({ selectAllOnCtrlA })
    }
  },
  created () {
    this.$_CGrid_defineColumns = []
  },
  mounted () {
    this.$_CGrid_cancelNextTickUpdate()
    if (this.rawGrid) {
      this.rawGrid.dispose()
      this.rawGrid = null
    }
    _initGrid(this)
  },
  // for Vue 3
  unmounted () {
    destroyed(this)
  },
  // for Vue 2
  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  destroyed () {
    destroyed(this)
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  methods: {
    /**
     * Redraws the whole grid.
     * @return {void}
     */
    invalidate () {
      if (this.rawGrid) {
        this.$_CGrid_ifDelayingForceUpdate()
        this.rawGrid.invalidate()
      }
    },
    /**
     * Apply the changed size.
     * @return {void}
     */
    updateSize () {
      if (this.rawGrid) {
        this.$_CGrid_ifDelayingForceUpdate()
        this.rawGrid.updateSize()
      }
    },
    /**
     * Apply the changed scroll size.
     * @return {void}
     */
    updateScroll () {
      if (this.rawGrid) {
        this.$_CGrid_ifDelayingForceUpdate()
        this.rawGrid.updateScroll()
      }
    },
    /**
     * @private
     */
    $_CGrid_nextTickInvalidate () {
      const id = ++seq
      this._nextTickInvalidateId = id
      this.$nextTick(() => {
        if (this._nextTickInvalidateId === id) {
          this.invalidate()
        }
      })
    },
    /**
     * @private
     */
    $_CGrid_nextTickUpdate () {
      const id = ++seq
      this._nextTickUpdateId = id
      this.$nextTick(() => {
        if (this._nextTickUpdateId === id) {
          this.$_CGrid_update()
        }
      })
    },
    /**
     * @private
     */
    $_CGrid_cancelNextTickUpdate () {
      this._nextTickUpdateId = undefined
    },
    /**
     * @private
     */
    $_CGrid_ifDelayingForceUpdate () {
      if (this._nextTickUpdateId) {
        this.$_CGrid_update()
      }
    },
    /**
     * @private
     */
    $_CGrid_update () {
      this.$_CGrid_cancelNextTickUpdate()
      if (this.rawGrid) {
        const gridProps = _buildGridProps(this)
        if (deepObjectEquals(this._beforeGridProps, gridProps)) {
          // optionの変更が無ければ、ここからの操作はしない
          return
        }

        const newProps = extend({}, gridProps)
        const beforeGridProps = extend({}, this._beforeGridProps)
        delete beforeGridProps.header
        delete newProps.header
        delete beforeGridProps.layout
        delete newProps.layout
        delete beforeGridProps.theme
        delete newProps.theme

        if (deepObjectEquals(beforeGridProps, newProps)) {
          // 操作可能なoptionのみの変更。インスタンス再作成はしない
          const options = _buildGridOption(this)
          const {
            header,
            layout,
            theme
          } = options
          if (!deepObjectEquals(this._beforeGridProps.header, gridProps.header)) {
            this.rawGrid.header = header
          }
          if (!deepObjectEquals(this._beforeGridProps.layout, gridProps.layout)) {
            this.rawGrid.layout = layout
          }
          this.rawGrid.theme = theme
          this.$_CGrid_nextTickInvalidate()
          this._beforeGridProps = extend({}, gridProps)
          return
        }
        this.rawGrid.dispose()
        _initGrid(this)
      }
    },
    /**
     * @private
     */
    $_CGrid_emit (type, ...args) {
      // emit grid event
      switch (type) {
        case 'click-cell':
          /**
           * Click on cell.
           */
          this.$emit('click-cell', ...args)
          break
        case 'dblclick-cell':
          /**
           * Doubleclick on cell.
           */
          this.$emit('dblclick-cell', ...args)
          break
        case 'selected-cell':
          /**
           * Selected cell.
           */
          this.$emit('selected-cell', ...args)
          break
        case 'paste-cell':
          /**
           * Paste on cell.
           */
          this.$emit('paste-cell', ...args)
          break
        case 'changed-value':
          /**
           * Changed value.
           */
          this.$emit('changed-value', ...args)
          break
        case 'changed-header-value':
          /**
           * Changed header value.
           */
          this.$emit('changed-header-value', ...args)
          break
          // TODO others
        default:
          this.$emit(type, ...args)
          break
      }
    },
    /**
     * @private
     */
    $_CGrid_setColumnDefine (colDef) {
      const index = this.$_CGrid_defineColumns.indexOf(colDef)
      if (index >= 0) {
        return
      }
      this.$_CGrid_defineColumns.push(colDef)
    },
    /**
     * @private
     */
    $_CGrid_removeColumnDefine (colDef) {
      const index = this.$_CGrid_defineColumns.indexOf(colDef)
      if (index < 0) {
        return
      }
      this.$_CGrid_defineColumns.splice(index, 1)
    },
    /**
     * @private
     */
    $_CGrid_updateKeyboardOptions (options) {
      if (this.rawGrid) {
        if (this.rawGrid.keyboardOptions) {
          this.rawGrid.keyboardOptions = Object.assign({}, this.rawGrid.keyboardOptions, options)
        } else {
          this.rawGrid.keyboardOptions = options
        }
      }
    }
  }
}
function destroyed (vm) {
  vm.$_CGrid_cancelNextTickUpdate()
  if (vm.rawGrid) {
    vm.rawGrid.dispose()
    vm.rawGrid = null
  }
  if (vm._dataSources) {
    vm._dataSources.forEach(dc => dc.dispose())
  }
  vm.$_CGrid_defineColumns = []
}
</script>

<style scoped>
.c-grid {
  height: 100%;
  width: 100%;
}
.c-grid .define {
  display: none !important;
  position: fixed;
  top: -300px;
  left: -300px;
}
</style>
