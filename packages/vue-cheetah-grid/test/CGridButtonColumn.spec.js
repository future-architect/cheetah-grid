import { expect } from 'chai'
import sinon from 'sinon'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import * as cheetahGrid from 'cheetah-grid'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid-button-column', () => {
  it('Should call the action, if click a button.', () => {
    const onAction = sinon.spy()
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-button-column
        @click="onAction"
        caption="test">test</c-grid-button-column>
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
        onAction () {
          onAction({ record: 123 })
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)
    const [action] = rawGrid.header
    expect(action.action).to.be.an.instanceof(cheetahGrid.columns.action.Action)
    rawGrid.fireListeners('click_cell', { row: 1, col: 0 })
    expect(onAction.getCall(0).args).to.deep.equal([{ record: 123 }])
  })

  it('Should not call the action, if click a disabled button.', () => {
    const onAction = sinon.spy()
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-button-column
        disabled
        @click="onAction"
        caption="test">test</c-grid-button-column>
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
        onAction () {
          onAction({ record: 123 })
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    rawGrid.fireListeners('click_cell', { row: 1, col: 0 })
    expect(onAction.called).to.equal(false)
  })

  it('Should be reactive the `disabled` property.', () => {
    let onAction = sinon.spy()
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-button-column
        :disabled="disabled"
        @click="onAction"
        caption="test">test</c-grid-button-column>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ],
          disabled: false
        }
      },
      methods: {
        onAction () {
          onAction({ record: 123 })
        }
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    const { rawGrid } = wrapper.vm.$refs.grid
    rawGrid.fireListeners('click_cell', { row: 1, col: 0 })
    expect(onAction.called).to.equal(true)

    wrapper.vm.disabled = true
    return wrapper.vm.$nextTick()
      .then(() => {
        onAction = sinon.spy()
        rawGrid.fireListeners('click_cell', { row: 1, col: 0 })
        expect(onAction.called).to.equal(false)
      })
      .then(() => {
        wrapper.vm.disabled = false
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        onAction = sinon.spy()
        rawGrid.fireListeners('click_cell', { row: 1, col: 0 })
        expect(onAction.called).to.equal(true)
      })
  })
})
