import chai from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
const { expect } = chai

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid-header', () => {
  it('layout header', () => {
    const Component = {
      template: `
    <c-grid style="height:300px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <template slot="layout-header">
        <c-grid-layout-row>
          <c-grid-header caption="test"/>
          <c-grid-header caption="test2" rowspan="2"/>
        </c-grid-layout-row>
        <c-grid-layout-row>
          <c-grid-header caption="test3"/>
        </c-grid-layout-row>
      </template>
      <template slot="layout-body">
        <c-grid-layout-row>
          <c-grid-column
            field="text"
            caption="test"/>
          <c-grid-column
            field="text"
            caption="test"/>
        </c-grid-layout-row>
      </template>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: '12345' },
            { text: '67890' }
          ]
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.layout.header.length).to.equal(2)
    expect(rawGrid.layout.header[0].length).to.equal(2)
    expect(rawGrid.layout.header[1].length).to.equal(1)
    expect(rawGrid.layout.body.length).to.equal(1)
    expect(rawGrid.layout.body[0].length).to.equal(2)
  })

  it('layout body only', () => {
    const Component = {
      template: `
    <c-grid style="height:300px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <template slot="layout-body">
        <c-grid-layout-row>
          <c-grid-column
            field="text"
            caption="test1" rowspan="2"/>
          <c-grid-column
            field="text"
            caption="test2"/>
        </c-grid-layout-row>
        <c-grid-layout-row>
          <c-grid-column
            field="text"
            caption="test3"/>
        </c-grid-layout-row>
      </template>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: '12345' },
            { text: '67890' }
          ]
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.layout.header.length).to.equal(2)
    expect(rawGrid.layout.header[0].length).to.equal(2)
    expect(rawGrid.layout.header[1].length).to.equal(1)
    expect(rawGrid.layout.body.length).to.equal(2)
    expect(rawGrid.layout.body[0].length).to.equal(2)
    expect(rawGrid.layout.body[1].length).to.equal(1)
  })
})
