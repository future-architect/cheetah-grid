<template>
  <div class="c-grid">
    <!-- Use this slot to set the columns definition -->
    <div class="define">
      <slot />
    </div>
  </div>
</template>

<script>
import { cheetahGrid, gridUpdateWatcher } from './c-grid/utils'
import { slotsToHeaderOptions, slotsToHeaderProps } from './c-grid/header-utils'

function deepObjectEquals (a, b) {
  if (a === b) {
    return true
  }
  if (typeof a !== typeof b ||
    a.constructor !== b.constructor) {
    return false
  }
  if (typeof a === 'function') {
    return false
  }
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  if (aKeys.length !== bKeys.length) {
    return false
  }
  for (let i = 0; i < aKeys.length; i++) {
    const value = aKeys[i]
    if (!deepObjectEquals(a[value], b[value])) {
      return false
    }
  }
  return true
}

function _setGridData (grid, data, filter) {
  let dataSource
  if (Array.isArray(data)) {
    if (filter) {
      dataSource = cheetahGrid.data.CachedDataSource.ofArray(data)
    } else {
      grid.records = data
      return
    }
  } else if (data instanceof cheetahGrid.data.DataSource) {
    dataSource = data
  } else {
    dataSource = new cheetahGrid.data.CachedDataSource(data)
  }
  if (filter) {
    if (dataSource instanceof cheetahGrid.data.FilterDataSource) {
      dataSource.filter = filter
    } else {
      dataSource = new cheetahGrid.data.FilterDataSource(dataSource, filter)
    }
  }
  grid.dataSource = dataSource
}
function _bindEvents (v, grid) {
  const { EVENT_TYPE } = cheetahGrid.ListGrid
  grid.listen(EVENT_TYPE.CHANGED_HEADER_VALUE, (...args) => {
    v.headerValues = grid.headerValues
  })
  for (const k in EVENT_TYPE) {
    const type = EVENT_TYPE[k]
    const emitType = type.replace(/_/g, '-').toLowerCase()
    grid.listen(type, (...args) => {
      const results = []

      // emit grid event
      v.$emit(emitType, ...args, (r) => {
        results.push(r)
      })

      // emit column event
      const [first] = args
      const col = first && first.col != null && typeof first.col === 'number' ? first.col : null
      const row = first && first.row != null && typeof first.row === 'number' ? first.row : null

      if (col != null) {
        if (row != null && grid.frozenRowCount > row) {
          const define = grid.getHeaderDefine(col, row)
          if (define && define.vm) {
            define.vm.$emit(emitType, ...args, (r) => {
              results.push(r)
            })
          }
        } else {
          const define = grid.getColumnDefine(col)
          if (define && define.vm) {
            define.vm.$emit(emitType, ...args, (r) => {
              results.push(r)
            })
          }
        }
      }
      return results[0]
    })
  }
}
function _buildGridProps (v) {
  return Object.assign({
    frozenColCount: v.frozenColCount - 0,
    theme: v.theme || null
  }, { header: slotsToHeaderProps(v.$slots.default) }, v.options)
}
function _buildGridOption (v) {
  return Object.assign({
    frozenColCount: v.frozenColCount - 0,
    theme: v.theme || null
  }, { header: slotsToHeaderOptions(v.$slots.default) }, v.options)
}
function _initGrid (v) {
  v._beforeGridProps = _buildGridProps(v)
  const options = _buildGridOption(v)
  options.parentElement = v.$el
  const grid = v.rawGrid = new cheetahGrid.ListGrid(options)
  _setGridData(grid, v.data, v.filter)
  _bindEvents(v, grid)
}

let seq = 0

export default {
  name: 'CGrid',
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
     * Defines a records filter
     */
    filter: {
      type: [Function],
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
     * Defines a raw options for Cheetah Grid
     */
    options: {
      type: Object,
      default: undefined
    }
  },
  data () {
    return { headerValues: {} }
  },
  computed: {
  },
  watch: {
    data (data) {
      if (this.rawGrid) {
        _setGridData(this.rawGrid, data, this.filter)
      }
    },
    filter (filter) {
      if (this.rawGrid) {
        _setGridData(this.rawGrid, this.data, filter)
      }
    },
    frozenColCount (frozenColCount) {
      if (this.rawGrid) {
        this.rawGrid.frozenColCount = frozenColCount
      }
    },
    options: gridUpdateWatcher,
    headerValues: {
      handler (headerValues) {
        this.rawGrid.headerValues = headerValues
      },
      deep: true
    }
  },
  mounted () {
    this.$_CGrid_cancelNextTickUpdate()
    if (this.rawGrid) {
      this.rawGrid.dispose()
      this.rawGrid = null
    }
    _initGrid(this)
  },
  destroyed () {
    this.$_CGrid_cancelNextTickUpdate()
    if (this.rawGrid) {
      this.rawGrid.dispose()
      this.rawGrid = null
    }
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
        const beforeGridProps = Object.assign({}, this._beforeGridProps)
        if (deepObjectEquals(beforeGridProps, gridProps)) {
        // optionの変更が無ければ、ここからの操作はしない
          return
        }

        const newProps = Object.assign({}, gridProps)
        delete beforeGridProps.header
        delete newProps.header
        delete beforeGridProps.frozenColCount
        delete newProps.frozenColCount
        delete beforeGridProps.theme
        delete newProps.theme
        if (deepObjectEquals(beforeGridProps, newProps)) {
          // 操作可能なoptionのみの変更。インスタンス再作成はしない
          const options = _buildGridOption(this)
          const { header, frozenColCount, theme } = options
          this.rawGrid.header = header
          this.rawGrid.frozenColCount = frozenColCount
          this.rawGrid.theme = theme
          this.rawGrid.invalidate()
          this._beforeGridProps = Object.assign({}, gridProps)
          return
        }
        this.rawGrid.dispose()
        _initGrid(this)
      }
    }
  }
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
