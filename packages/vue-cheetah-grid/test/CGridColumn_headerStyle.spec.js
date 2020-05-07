import chai from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
const { expect } = chai

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid-column headerStyle', () => {
  it('headerStyle', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-column
        field="num"
        :header-style="headerStyle"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { num: '12345' }
          ],
          headerStyle: {
            font: '9px sans-serif'
          }
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)
    const [col] = rawGrid.header
    expect(col.headerStyle.font).to.equal('9px sans-serif')
  })
})
