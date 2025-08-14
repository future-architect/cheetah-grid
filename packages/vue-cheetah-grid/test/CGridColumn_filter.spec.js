import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import CGrid from '../lib/index'

describe('c-grid-column filter', () => {
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
      global: {
        plugins: [CGrid]
      }
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
      global: {
        plugins: [CGrid]
      }
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    const value = rawGrid.getCopyCellValue(0, 1)
    expect(value).to.equal('texttext')
  })
})
