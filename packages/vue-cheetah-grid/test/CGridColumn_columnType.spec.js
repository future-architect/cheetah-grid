import chai from 'chai'
import sinon from 'sinon'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import * as cheetahGrid from 'cheetah-grid'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
const { expect } = chai

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid-column ColumnType', () => {
  it('ColumnType name', () => {
    const format = new Intl.NumberFormat()
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-column
        field="num"
        :column-type="colType"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { num: '12345' }
          ],
          colType: {
            typeName: 'NumberColumn',
            option: {
              format
            }
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
    expect(col.columnType).to.be.an.instanceof(cheetahGrid.columns.type.NumberColumn)
    expect(col.columnType.format).to.equal(format)
  })
  it('ColumnType function & name', () => {
    const format = new Intl.NumberFormat()
    const colType = sinon.spy(() => ({
      typeName: 'NumberColumn',
      option: {
        format
      }
    }))
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-column
        field="num"
        :column-type="colType"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { num: '12345' }
          ],
          colType
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)
    expect(colType).have.been.callCount(1)
    const [col] = rawGrid.header
    expect(col.columnType).to.be.an.instanceof(cheetahGrid.columns.type.NumberColumn)
    expect(col.columnType.format).to.equal(format)
  })
  it('ColumnType function & text', () => {
    const colType = sinon.spy(() => 'number')
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-column
        field="num"
        :column-type="colType"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { num: '12345' }
          ],
          colType
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)
    expect(colType).have.been.callCount(1)
    const [col] = rawGrid.header
    expect(col.columnType).to.equal('number')
  })
})
