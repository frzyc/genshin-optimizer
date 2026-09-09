import { describe, expect, it } from 'vitest'
import { weaponUiSheets } from './weaponUiSheets'

function condNames(weaponKey: keyof typeof weaponUiSheets) {
  return weaponUiSheets[weaponKey].documents.flatMap((d) =>
    d.type === 'conditional' ? [d.conditional.metadata.name] : []
  )
}

describe('weaponUiSheets', () => {
  it('attaches Widsith Debut list conditional', () => {
    expect(condNames('TheWidsith')).toContain('Debut')
    const listCond = weaponUiSheets.TheWidsith.documents.find(
      (d) => d.type === 'conditional'
    )
    expect(listCond?.type).toBe('conditional')
    if (listCond?.type === 'conditional') {
      expect(typeof listCond.conditional.badge).toBe('function')
      expect(typeof listCond.conditional.label).not.toBe('string')
    }
  })

  it('attaches Homa RecklessCinnabar bool', () => {
    expect(condNames('StaffOfHoma')).toContain('RecklessCinnabar')
  })

  it('has an empty document list for weapons without conds', () => {
    expect(weaponUiSheets.DullBlade.documents).toEqual([])
  })
})
