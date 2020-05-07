import { expect } from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('c-grid update', () => {
  it('CGrid update data', () => {
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
        onAction () {}
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    wrapper.vm.data = [
      ...wrapper.vm.data,
      ...wrapper.vm.data
    ]
    return wrapper.vm.$nextTick()
      .then(() => {
        const { rawGrid } = wrapper.vm.$refs.grid
        expect(rawGrid.records.length).to.equal(2)
      })
  })
  it('CGrid update header', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-column
        field="text"
        caption="test"/>
      <c-grid-button-column v-if="showButton"
        @click="onAction"
        caption="test">test</c-grid-button-column>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ],
          showButton: false
        }
      },
      methods: {
        onAction () {}
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    let { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.header.length).to.equal(1)

    wrapper.vm.showButton = true
    return wrapper.vm.$nextTick()
      .then(() => {
        ({ rawGrid } = wrapper.vm.$refs.grid)
        expect(rawGrid.header.length).to.equal(2)
      })
  })
  it('CGrid no update header', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="1">
      <c-grid-column
        field="text"
        caption="test"/>
      <c-grid-button-column
        v-if="showButton"
        @click="onAction"
        :caption="caption">test</c-grid-button-column>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ],
          showButton: true,
          caption: 'testCaption'
        }
      },
      methods: {
        onAction () {}
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    let { rawGrid } = wrapper.vm.$refs.grid
    const before = rawGrid.header

    wrapper.vm.showButton = 1234
    return wrapper.vm.$nextTick()
      .then(() => {
        ({ rawGrid } = wrapper.vm.$refs.grid)
        expect(rawGrid.header).to.equal(before)
      })
      .then(() => {
        wrapper.vm.caption = 'testCaption'
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        ({ rawGrid } = wrapper.vm.$refs.grid)
        expect(rawGrid.header).to.equal(before)
      })
  })
  it('CGrid update frozen-col-count', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :frozen-col-count="frozenColCount">
      <c-grid-column
        field="text"
        caption="test"/>
      <c-grid-button-column
        @click="onAction"
        caption="caption">test</c-grid-button-column>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ],
          frozenColCount: 1
        }
      },
      methods: {
        onAction () {}
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    let { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.frozenColCount).to.equal(1)

    wrapper.vm.frozenColCount = 2
    return wrapper.vm.$nextTick()
      .then(() => {
        ({ rawGrid } = wrapper.vm.$refs.grid)
        expect(rawGrid.frozenColCount).to.equal(2)
      })
  })
  it('CGrid update filter', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :filter="filter"
      :frozen-col-count="1">
      <c-grid-column
        field="text"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text1' },
            { text: 'text2' }
          ],
          filter: undefined
        }
      },
      methods: {
        onAction () {}
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    let { rawGrid } = wrapper.vm.$refs.grid
    expect(rawGrid.dataSource.length).to.equal(2)

    wrapper.vm.filter = (rec) => rec.text === 'text1'
    return wrapper.vm.$nextTick()
      .then(() => {
        ({ rawGrid } = wrapper.vm.$refs.grid)
        expect(rawGrid.dataSource.length).to.equal(1)
      })
  })
  it('CGrid update class & textContent', () => {
    const Component = {
      template: `
    <c-grid style="height:100px;"
      ref="grid"
      :data="data"
      :class="classData">
      {{ context }}
      <c-grid-column
        field="text"
        caption="test"/>
    </c-grid>
  `,
      data () {
        return {
          data: [
            { text: 'text' }
          ],
          classData: {},
          context: ''
        }
      },
      methods: {
        onAction () {}
      }
    }
    const wrapper = mount(Component, {
      localVue,
      attachTo: '.test-root-element'
    })
    let { rawGrid } = wrapper.vm.$refs.grid
    const before = rawGrid.header

    wrapper.vm.classData = ['test']
    wrapper.vm.context = 'context';
    ({ rawGrid } = wrapper.vm.$refs.grid)
    expect(rawGrid.header).to.equal(before)
  })
})
