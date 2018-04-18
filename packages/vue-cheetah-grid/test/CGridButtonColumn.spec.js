import { expect } from 'chai'
import sinon from 'sinon'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import cheetahGrid from 'cheetah-grid'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid-button-column', () => {
  it('Button click', () => {
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
            {text: 'text'}
          ]
        }
      },
      methods: {
        onAction
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachToDocument: true
    })
    const {rawGrid} = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)
    const [action] = rawGrid.header
    expect(action.action).to.be.an.instanceof(cheetahGrid.columns.action.Action)
    action.action._action({record: 123})
    expect(onAction.getCall(0).args).to.deep.equal([{record: 123}])
  })
})
