import { formulas } from '@genshin-optimizer/zzz/formula'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formulaFieldTitle } from './bundledFormulaFields'
import { OptTargetSelectedLabel } from './optTargetDisplay'

describe('OptTargetSelectedLabel', () => {
  it('renders CharBase inst formulas from the Other opt-target section', () => {
    const tag = formulas.Yixuan.sheerDmgInst.tag
    const { container } = render(
      <OptTargetSelectedLabel charKey="Yixuan" tag={tag} />
    )
    expect(container.textContent).toContain('Damage')
    expect(container.textContent).not.toBe('sheerDmg')
  })
})

describe('opt target label parity with formulaFieldTitle', () => {
  it.each([
    ['Yixuan', formulas.Yixuan.sheerDmgInst.tag],
    ['Anby', formulas.Anby.anomalyDmgInst.tag],
    ['Anby', formulas.Anby.standardDmgInst.tag],
  ] as const)('%s inst formula matches formulaFieldTitle', (charKey, tag) => {
    const { container: field } = render(formulaFieldTitle(tag))
    const { container: selected } = render(
      <OptTargetSelectedLabel charKey={charKey} tag={tag} />
    )
    expect(selected.textContent).toBe(field.textContent)
  })
})
