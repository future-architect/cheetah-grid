import { expect } from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import Sample from './Sample.vue'
import cheetahGrid from 'cheetah-grid'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('sample', () => {
  const wrapper = mount(Sample, { localVue, attachToDocument: true })
  const { rawGrid } = wrapper.vm.$refs.grid
  it('header config', () => {
    expect(rawGrid.header.length).to.equal(7)
    const [check, id, group, input, link, menu, percent] = rawGrid.header
    expect(check).to.own.include({ caption: '', field: 'check', columnType: 'check', width: 50 })
    expect(check.action).to.be.an.instanceof(cheetahGrid.columns.action.CheckEditor)
    expect(id).to.own.include({ caption: 'ID', field: 'id', width: '85' })
    //
    expect(group.caption).to.equal('GROUP')

    const [button, icon] = group.columns
    expect(button).to.own.include({ caption: 'BUTTON', width: '100' })
    expect(button.columnType).to.be.an.instanceof(cheetahGrid.columns.type.ButtonColumn)
    expect(button.action).to.be.an.instanceof(cheetahGrid.columns.action.ButtonAction)

    expect(icon).to.own.include({ caption: 'ICON', field: 'stars', width: '75' })
    expect(icon.columnType).to.be.an.instanceof(cheetahGrid.columns.type.IconColumn)
    expect(icon.columnType._name).to.equal('star')
    //

    expect(input).to.own.include({ caption: 'INPUT', field: 'text', width: 75 })
    expect(input.action).to.be.an.instanceof(cheetahGrid.columns.action.SmallDialogInputEditor)

    expect(link).to.own.include({ caption: 'LINK', field: 'link', width: 75 })
    expect(link.action).to.be.an.instanceof(cheetahGrid.columns.action.Action)

    expect(menu).to.own.include({ caption: 'MENU', field: 'menu', width: 75 })
    expect(menu.columnType).to.be.an.instanceof(cheetahGrid.columns.type.MenuColumn)
    expect(menu.columnType.options).to.deep.equal([{ value: '', caption: 'Empty' }, { value: 1, caption: 'Opt1' }, { value: 2, caption: 'Opt2' }])
    expect(menu.action).to.be.an.instanceof(cheetahGrid.columns.action.InlineMenuEditor)
    expect(menu.action.options).to.deep.equal([{ value: '', caption: 'Empty' }, { value: 1, caption: 'Opt1' }, { value: 2, caption: 'Opt2' }])

    expect(percent).to.own.include({ caption: 'PERCENT', field: 'percent', width: 90 })
    expect(percent.columnType).to.be.an.instanceof(cheetahGrid.columns.type.PercentCompleteBarColumn)
  })
})
