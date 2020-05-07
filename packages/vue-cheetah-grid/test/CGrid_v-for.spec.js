import { expect } from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid v-for', () => {
  it('It should work even if columns are defined by v-for.', () => {
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
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)

    wrapper.vm.cols.push({ id: 1 })
    return wrapper.vm.$nextTick()
      .then(() => {
        expect(rawGrid.header.length).to.equal(2)
        expect(rawGrid.colCount).to.equal(2)

        wrapper.vm.cols.push({ id: 2 })
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        expect(rawGrid.header.length).to.equal(3)
        expect(rawGrid.colCount).to.equal(3)

        wrapper.vm.cols.push({ id: 3 })
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        expect(rawGrid.header.length).to.equal(4)
        expect(rawGrid.colCount).to.equal(4)
      })
  })

  it('It should work even if more than one column is defined by v-for.', () => {
    const Component = {
      template: `
        <c-grid style="height:200px;"
          ref="grid"
          :data="data">
          <c-grid-column-group v-for="col in cols1"
            :key="col.id"
            :caption="col.id + ''">
            <c-grid-input-column :field="col.id + ''"
                    :caption="col.id + ''">
            </c-grid-input-column>
          </c-grid-column-group>
          <c-grid-column-group v-for="col in cols2"
            :key="col.id+ '_2'"
            :caption="col.id + '_2'">
            <c-grid-input-column :field="col.id + ''"
                    :caption="col.id + ''">
            </c-grid-input-column>
          </c-grid-column-group>
        </c-grid>
      `,
      data () {
        return {
          cols1: [{
            id: 0
          }],
          cols2: [{
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
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(2)

    wrapper.vm.cols1.push({ id: 1 })
    return wrapper.vm.$nextTick()
      .then(() => {
        expect(rawGrid.header.length).to.equal(3)
        expect(rawGrid.colCount).to.equal(3)

        wrapper.vm.cols2.push({ id: 2 })
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        expect(rawGrid.header.length).to.equal(4)
        expect(rawGrid.colCount).to.equal(4)

        wrapper.vm.cols1.push({ id: 3 })
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        expect(rawGrid.header.length).to.equal(5)
        expect(rawGrid.colCount).to.equal(5)
      })
  })
})
