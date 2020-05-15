import { expect } from 'chai'
import { mount, createLocalVue } from '@vue/test-utils'
import CGrid from '../lib/index'
import Sample from './Sample.vue'
import * as cheetahGrid from 'cheetah-grid'

const localVue = createLocalVue()
localVue.use(CGrid)

describe('sample', () => {
  const wrapper = mount(Sample, { localVue, attachTo: '.test-root-element' })
  const { rawGrid } = wrapper.vm.$refs.grid
  it('header config', () => {
    expect(rawGrid.header.length).to.equal(7)
    const [check, id, group, input, link, menu, percent] = rawGrid.header
    expect(check).to.own.include({ field: 'check', columnType: 'check', width: 50 })
    expect(check.caption()).to.equal('')
    expect(check.action).to.be.an.instanceof(cheetahGrid.columns.action.CheckEditor)
    expect(id).to.own.include({ field: 'id', width: '85' })
    expect(id.caption()).to.equal('ID')
    //
    expect(group.caption).to.equal('GROUP')

    const [button, icon] = group.columns
    expect(button).to.own.include({ width: '100' })
    expect(button.caption()).to.equal('BUTTON')
    expect(button.columnType).to.be.an.instanceof(cheetahGrid.columns.type.ButtonColumn)
    expect(button.action).to.be.an.instanceof(cheetahGrid.columns.action.ButtonAction)

    expect(icon).to.own.include({ field: 'stars', width: '75' })
    expect(icon.caption()).to.equal('ICON')
    expect(icon.columnType).to.be.an.instanceof(cheetahGrid.columns.type.IconColumn)
    expect(icon.columnType._name).to.equal('star')
    //

    expect(input).to.own.include({ field: 'text', width: 75 })
    expect(input.caption()).to.equal('INPUT')
    expect(input.action).to.be.an.instanceof(cheetahGrid.columns.action.SmallDialogInputEditor)

    expect(link).to.own.include({ field: 'link', width: 75 })
    expect(link.caption()).to.equal('LINK')
    expect(link.action).to.be.an.instanceof(cheetahGrid.columns.action.Action)

    expect(menu).to.own.include({ field: 'menu', width: 75 })
    expect(menu.caption()).to.equal('MENU')
    expect(menu.columnType).to.be.an.instanceof(cheetahGrid.columns.type.MenuColumn)
    expect(menu.columnType.options).to.deep.equal([{ value: '', label: 'Empty' }, { value: 1, label: 'Opt1' }, { value: 2, label: 'Opt2' }])
    expect(menu.action).to.be.an.instanceof(cheetahGrid.columns.action.InlineMenuEditor)
    expect(menu.action.options(rawGrid.records[0])).to.deep.equal([{ value: '', label: 'Empty' }, { value: 1, label: 'Opt1' }, { value: 2, label: 'Opt2' }])

    expect(percent).to.own.include({ field: 'percent', width: 90 })
    expect(percent.caption()).to.equal('PERCENT')
    expect(percent.columnType).to.be.an.instanceof(cheetahGrid.columns.type.PercentCompleteBarColumn)
  })
})
