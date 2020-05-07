import { expect } from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'

const localVue = createLocalVue()
localVue.use(CGrid)
localVue.filter('reverse', (value) => {
  return value.split('').reverse().join('')
})
localVue.filter('append', (value, s) => {
  return value + s
})

describe('c-grid-column filter', () => {
  it('filter', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="text"
        filter="reverse"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: '12345' }
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal('54321')
  })
  it('filter fn', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="text"
        :filter="function(t) { return t + t }"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal('texttext')
  })
  it('filter get set', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        :field="{get: function(r) {return r.text},set: function(rec, v) {rec.text = v}}"
        :filter="function(t) { return t + t }"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal('texttext')
  })
  it('filter ()', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="text"
        filter="append('_suffix')"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal('text_suffix')
  })
  it('filter Promise value', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="text"
        filter="reverse"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { get text () { return Promise.resolve('12345') } }
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    return value.then((v) => {
      expect(v).to.equal('54321')
    })
  })
  it('filter Promise record', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="text"
        filter="reverse"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: {
            get: () => Promise.resolve({ text: '12345' }),
            length: 1
          }
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    return value.then((v) => {
      expect(v).to.equal('54321')
    })
  })
  it('filter nested', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="c.text"
        filter="reverse"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { c: { text: '12345' } }
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal('54321')
  })
  it('filter null record', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data">
      <c-grid-column
        field="text"
        filter="reverse"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            null
          ]
        }
      },
      methods: {
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal(undefined)
  })
})
