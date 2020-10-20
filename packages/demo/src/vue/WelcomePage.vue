<template>
  <div class="home">
    <div class="page-title">
      <h1>Welcome to Cheetah Grid</h1>
      <span>Cheetah Grid is the fastest open-source data table for web.</span>
    </div>
    <label>Grid initial processing time : </label><strong>{{ time }}ms</strong> / <label>Number of records : </label><strong>{{ numberDelimiter(count) }}</strong>
    <br>
    <div
      ref="grid"
      class="grid"
    />
  </div>
</template>
<script>
import cheetahGrid from 'cheetah-grid'
import { generatePersonsDataSource } from './common'

function createGrid (el, v) {
  const personsDataSource = generatePersonsDataSource(1000000)

  const startTime = new Date()

  const grid = new cheetahGrid.ListGrid({
    parentElement: el,
    allowRangePaste: true,
    header: [
      { field: 'check', caption: '', width: 50, columnType: 'check', action: 'check' },
      { field: 'personid', caption: 'ID', width: 85 },
      {
        field: 'stars',
        caption: 'Class',
        width: 150,
        columnType: new cheetahGrid.columns.type.IconColumn({
          name: 'star'
        }),
        style: {
          color: 'gold'
        },
        action: new cheetahGrid.columns.action.InlineMenuEditor({
          options: [
            { value: 1, classList: 'stars', html: '<i class="material-icons">star</i>' },
            { value: 2, classList: 'stars', html: '<i class="material-icons">star</i>'.repeat(2) },
            { value: 3, classList: 'stars', html: '<i class="material-icons">star</i>'.repeat(3) },
            { value: 4, classList: 'stars', html: '<i class="material-icons">star</i>'.repeat(4) },
            { value: 5, classList: 'stars', html: '<i class="material-icons">star</i>'.repeat(5) }
          ]
        })
      },
      {
        caption: 'Name',
        columns: [
          {
            field: 'fname',
            caption: 'First Name',
            width: '20%',
            minWidth: 150,
            action: new cheetahGrid.columns.action.SmallDialogInputEditor({
              classList: 'helper-text--right-justified',
              helperText (value) {
                return `${value.length}/20`
              },
              inputValidator (value) {
                return value.length > 20 ? `over the max length. ${value.length}` : null
              }
            }),
            message (record) {
              const value = record.fname
              return value.length > 20 ? `over the max length. ${value.length}` : null
            }
          },
          {
            field: 'lname',
            caption: 'Last Name',
            width: '20%',
            minWidth: 150,
            action: new cheetahGrid.columns.action.SmallDialogInputEditor({
              classList: 'helper-text--right-justified',
              helperText (value) {
                return `${value.length}/20`
              },
              inputValidator (value) {
                return value.length > 20 ? `over the max length. ${value.length}` : null
              }
            }),
            message (record) {
              const value = record.lname
              return value.length > 20 ? `over the max length. ${value.length}` : null
            }
          }
        ]
      },
      {
        field: 'progress',
        caption: 'Progress',
        width: '10%',
        minWidth: 50,
        columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
          formatter (v) { return `${v}%` }
        }),
        style: {
          textAlign: 'right',
          padding: [0, 10, 0, 0]
        },
        action: new cheetahGrid.columns.action.SmallDialogInputEditor({
          type: 'number',
          classList: ['al-right'],
          inputValidator (value) {
            return value > 100 ? `over the max value. ${value}` : value < 0 ? `under the min value. ${value}` : null
          }
        }),
        message (record) {
          if (isNaN(record.progress)) {
            return 'Not a number.'
          }
          const value = record.progress - 0
          return value > 100 ? `over the max value. ${value}` : value < 0 ? `under the min value. ${value}` : null
        }
      },
      {
        field: 'email',
        caption: 'Email',
        width: 'calc(50% - 505px - 20px)',
        minWidth: 200,
        action: new cheetahGrid.columns.action.SmallDialogInputEditor({
          helperText (value) {
            return 'Email'
          },
          validator (value) {
            const ret = value.match(/^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)
            return ret ? null : 'Please enter email addr.'
          }
        }),
        message (record) {
          const value = record.email
          const ret = value.match(/^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)
          return ret ? null : 'Please enter email addr.'
        }
      },
      {
        field: {
          get (rec) {
            const d = rec.birthday
            return isNaN(d) ? d : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
          },
          set (rec, val) {
            const date = new Date(val)
            rec.birthday = isNaN(date) ? val : date
          }
        },
        caption: 'Birthday',
        width: 100,

        action: new cheetahGrid.columns.action.SmallDialogInputEditor({
          helperText (value) {
            return 'birthday'
          },
          validator (value) {
            return isNaN(new Date(value)) ? 'Please enter date.' : null
          }
        }),
        message (record) {
          const value = record.birthday
          return isNaN(new Date(value)) ? 'Please enter date.' : null
        }
      },
      {
        caption: '',
        width: 120,
        columnType: new cheetahGrid.columns.type.ButtonColumn({
          caption: 'SHOW REC'
        }),
        action: new cheetahGrid.columns.action.ButtonAction({
          action (rec) {
            alert(JSON.stringify(rec))
          }
        })
      }
    ],
    frozenColCount: 2,
    dataSource: personsDataSource
  })

  const endTime = new Date()

  v.time = endTime - startTime
  v.count = personsDataSource.length

  return grid
}

export default {
  name: 'Welcome',
  data () {
    return {
      time: '',
      count: ''
    }
  },
  mounted () {
    if (this.grid) {
      this.grid.dispose()
      this.grid = null
    }
    this.grid = createGrid(this.$refs.grid, this)
  },
  unmounted () {
    if (this.grid) {
      this.grid.dispose()
      this.grid = null
    }
  }
}
</script>

<style scoped>
  .grid ::v-deep(.cheetah-grid__inline-menu__menu-item.stars) {
    text-align: center;
    color: gold;
    display: block;
    white-space: nowrap;
  }
  .grid ::v-deep(.cheetah-grid__inline-menu__menu-item.stars .material-icons) {
    line-height: 40px;
  }
</style>
