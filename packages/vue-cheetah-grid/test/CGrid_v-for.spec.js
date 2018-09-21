import { expect } from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid v-for', () => {
  it('CGrid columns foreach', () => {
    const Component = {
      template: `
    <c-grid style="height:200px;"
      ref="grid"
      :data="data">
      <c-grid-column-group v-for="col in cols"
        :key="col.id"
        :caption="col.id + ''">
        <c-grid-input-column :field="col.id + ''"
                :caption="col.id + ''">
        </c-grid-input-column>
      </c-grid-column-group>
    </c-grid>
  `,
      data () {
        return {
          cols: [{
            id: 0
          }],
          data: [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
          ]
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachToDocument: true
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)

    wrapper.vm.cols.push({ id: 1 })
    expect(rawGrid.header.length).to.equal(2)
    wrapper.vm.cols.push({ id: 2 })
    expect(rawGrid.header.length).to.equal(3)
    wrapper.vm.cols.push({ id: 3 })
    expect(rawGrid.header.length).to.equal(4)
  })
})
