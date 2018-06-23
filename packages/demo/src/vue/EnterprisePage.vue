<template>
  <div class="home">
    <div class="page-title">
      <h1>Cheetah Grid is the ideal grid for enterprises</h1>
    </div>
    <input
      v-model="filterText"
      placeholder="Filter keyword"
      class="filter-input">
    <label>
      <input
        v-model="filterErrorOnly"
        type="checkbox"
        class="filter-checkbox">
      <span>Display only error records</span>
    </label>
    <div
      class="grid">
      <c-grid
        ref="grid"
        :data="data"
        :frozen-col-count="1"
        :filter="dataFilter"
        @changed-value="onChangedValue">
        <c-grid-column
          :width="50"
          field="check"
          column-type="check"
          action="check" />
        <c-grid-column
          field="personid"
          width= "85">
          ID
        </c-grid-column>
        <c-grid-icon-column
          :width="150"
          :column-style="{
            color: 'gold'
          }"
          :action="{
            actionName: 'InlineMenuEditor',
            option:{options: [
              {value: '', caption: 'Empty'},
              {value: 1, classList: 'stars', html: `<i class='material-icons'>star</i>`},
              {value: 2, classList: 'stars', html: `<i class='material-icons'>star</i>`.repeat(2)},
              {value: 3, classList: 'stars', html: `<i class='material-icons'>star</i>`.repeat(3)},
              {value: 4, classList: 'stars', html: `<i class='material-icons'>star</i>`.repeat(4)},
              {value: 5, classList: 'stars', html: `<i class='material-icons'>star</i>`.repeat(5)}
            ]}
          }"
          :message="starsValidateMessage"
          icon-name="star"
          field= "stars"
        >
          Class
        </c-grid-icon-column>
        <c-grid-column-group
          caption="Name">
          <c-grid-input-column
            :min-width="150"
            :helper-text="value => { return `${value.length}/20` }"
            :input-validator="value => { return value.length > 20 ? `over the max length. ${value.length}` : null }"
            :message="firstNameValidateMessage"
            input-class-list= "helper-text--right-justified"
            field= "fname"
            width= "20%"
          >
            First Name
          </c-grid-input-column>
          <c-grid-input-column
            :helper-text="value => { return `${value.length}/20` }"
            :input-validator="value => { return value.length > 20 ? `over the max length. ${value.length}` : null }"
            :message="lastNameValidateMessage"
            input-class-list= "helper-text--right-justified"
            field="lname"
            width= "20%"
            min-width="150"
          >
            Last Name
          </c-grid-input-column>
        </c-grid-column-group>

        <c-grid-percent-complete-bar-column
          :formatter="v => { return v ? `${v}%` : '' }"
          :column-style="{
            textAlign: 'right',
            padding: [0, 10, 0, 0]
          }"
          :action="{
            actionName: 'SmallDialogInputEditor',
            option: {
              type: 'number',
              classList: ['al-right'],
              inputValidator (value) {
                return value > 100 ? `over the max value. ${value}` : value < 0 ? `under the min value. ${value}` : null
              }

            }
          }"
          :message="progressValidateMessage"
          field= "progress"
          width= "10%"
          min-width="50"
        >
          Progress
        </c-grid-percent-complete-bar-column>
        <c-grid-input-column
          :validator="value => {
            const ret = value.match(/^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)
            return ret ? null : 'Please enter email addr.'
          }"
          :message="emailValidateMessage"
          helper-text="Email"
          field="email"
          width="calc(50% - 505px - 20px)"
          min-width="200"
        >
          Email
        </c-grid-input-column>
        <c-grid-input-column
          :field="{
            get (rec) {
              return rec.birthday
            },
            set (rec, val) {
              rec.birthday = new Date(val)
            }
          }"
          :validator="value => { return isNaN(new Date(value)) ? 'Please enter date.' : null }"
          :message="birthdayValidateMessage"
          helper-text="birthday"
          width="100"
          filter="dateFormat('yyyy/m/d')"
        >
          Birthday
        </c-grid-input-column>
        <c-grid-button-column
          :width="120"
          caption="SHOW REC"
          @click="clickRec"
        />
      </c-grid>
    </div>
  </div>
</template>
<script>
import {generatePersonsDataSource} from './common'

const personsDataSource = (() => {
  const baseDataSource = generatePersonsDataSource(1000000)
  const array = new Array(baseDataSource.length)
  function createMissingData (index) {
    const data = baseDataSource.get(index)
    if (!Math.floor(Math.random() * 10)) {
      data.stars = ''
    }
    if (!Math.floor(Math.random() * 10)) {
      data.progress = ''
    }
    if (!Math.floor(Math.random() * 10)) {
      data.email = ''
    }
    if (!Math.floor(Math.random() * 10)) {
      data.birthday = ''
    }
    return data
  }
  return {
    get (index) {
      return array[index] ? array[index] : (array[index] = createMissingData(index))
    },
    length: baseDataSource.length
  }
})()

const starsValidateMessage = (rec) => rec.stars ? null : 'Please select.'
const firstNameValidateMessage = rec => rec.fname ? null : 'Please enter First Name.'
const lastNameValidateMessage = rec => rec.lname ? null : 'Please enter Last Name.'
const progressValidateMessage = rec => rec.progress > 0 ? null : 'Please enter progress.'
const emailValidateMessage = rec => {
  const {email} = rec
  if (!email) {
    return {
      type: 'error',
      message: 'Please enter Email address.'
    }
  }
  if ((`${rec.fname.replace('-', '_')}_${rec.lname.replace('-', '_')}@example.com`).toLowerCase() !== email) {
    return {
      type: 'warning',
      message: 'Email address is incorrect.'
    }
  }
  return null
}
const birthdayValidateMessage = rec => rec.birthday ? null : 'Please enter birthday.'

export default {
  name: 'Enterprise',
  data () {
    return {
      data: personsDataSource,
      filterText: '',
      filterErrorOnly: false,
      dataFilter: undefined
    }
  },
  watch: {
    filterText (filterText) {
      this.onChangeFilter(filterText, this.filterErrorOnly)
    },
    filterErrorOnly (filterErrorOnly) {
      this.onChangeFilter(this.filterText, filterErrorOnly)
    }
  },
  methods: {
    onChangeFilter (filterText, filterErrorOnly) {
      if (filterText || filterErrorOnly) {
        const filterTexts = filterText.toLowerCase().split(/\s/g).filter(s => !!s)
        this.dataFilter = (rec) => {
          const recText = `${rec.personid}\n${rec.fname}\n${rec.lname}\n${rec.email}`.toLowerCase()
          if (!filterTexts.every(t => recText.includes(t))) {
            return false
          }
          if (filterErrorOnly) {
            return [
              starsValidateMessage,
              firstNameValidateMessage,
              lastNameValidateMessage,
              progressValidateMessage,
              emailValidateMessage,
              birthdayValidateMessage].some(m => !!m(rec))
          }
          return true
        }
      } else {
        this.dataFilter = undefined
      }
    },
    clickRec (rec) {
      alert(JSON.stringify(rec))
    },
    onChangedValue () {
      this.$refs.grid.invalidate()
    },
    starsValidateMessage,
    firstNameValidateMessage,
    lastNameValidateMessage,
    progressValidateMessage,
    emailValidateMessage,
    birthdayValidateMessage
  }
}
</script>

<style scoped>
  .grid >>> .cheetah-grid__inline-menu__menu-item.stars {
    text-align: center;
    color: gold;
    display: block;
    white-space: nowrap;
  }
  .grid >>> .cheetah-grid__inline-menu__menu-item.stars .material-icons {
    line-height: 40px;
  }
  .filter-input {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #9e9e9e;
    outline: none;
    height: 2.5rem;
    /*width: 50%;*/
    width: 300px;
    font-size: 16px;
    margin: 0 0 8px 0;
    transition: box-shadow .3s, border .3s;
    line-height: 2.5rem;
    box-sizing: content-box;
  }
  .filter-input:focus {
    border-bottom: 1px solid #2196f3;
    box-shadow: 0 1px 0 0 #2196f3;
  }
  .filter-checkbox {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    box-sizing: border-box;
    padding: 0;
    overflow: visible;
    font-size: 100%;
    line-height: 2.5rem;
    margin: 0;
  }

  .filter-checkbox[type="checkbox"]+span {
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    display: inline-block;
    height: 2.5rem;
    line-height: 2.5rem;
    font-size: 1rem;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .filter-checkbox[type="checkbox"]+span:before, .filter-checkbox[type="checkbox"]+span:after {
    content: '';
    left: 0;
    position: absolute;
    -webkit-transition: border .25s, background-color .25s, width .20s .1s, height .20s .1s, top .20s .1s, left .20s .1s;
    transition: border .25s, background-color .25s, width .20s .1s, height .20s .1s, top .20s .1s, left .20s .1s;
    z-index: 1;
  }
  .filter-checkbox[type="checkbox"]+span:before {
    top: calc(0.6rem + 1px);
    left: 0;
    width: 6px;
    height: 11px;
    border: 2px solid transparent;
    -webkit-transform: rotateZ(37deg);
    transform: rotateZ(37deg);
    -webkit-transform-origin: 100% 100%;
    transform-origin: 100% 100%;
  }
  .filter-checkbox[type="checkbox"]:checked+span:before {
    border-top: 2px solid transparent;
    border-left: 2px solid transparent;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
  }

  .filter-checkbox[type="checkbox"]+span:after {
    top: 0.6rem;
    width: 1rem;
    height: 1rem;
    border: 2px solid #ddd;
    background-color: transparent;
    z-index: 0;
    border-radius: 2px;
  }
  .filter-checkbox[type="checkbox"]:checked+span:after {
    border: 2px solid #2196f3;
    background-color: #2196f3;
  }
</style>
