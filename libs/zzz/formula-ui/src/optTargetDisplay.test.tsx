import { toTag } from '@genshin-optimizer/zzz/formula'
import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TagTitle } from './components/TagTitle'
import { OptTargetSelectedLabel } from './optTargetDisplay'

describe('OptTargetSelectedLabel', () => {
  it('renders CharBase inst formulas from the Other opt-target section', () => {
    const formulaRef = {
      sheet: 'Yixuan',
      name: 'sheerDmgInst',
      dim: 'sheerDmg',
    }
    const { container } = render(
      <OptTargetSelectedLabel formulaRef={formulaRef} />
    )
    expect(container.textContent).toContain('Damage')
    expect(container.textContent).not.toBe('sheerDmg')
  })
})

describe('opt target labels from formula tags', () => {
  it('falls back to TagTitle for generic inst', () => {
    const formulaRef = {
      sheet: 'Anby',
      name: 'standardDmgInst',
      dim: 'standardDmg',
    }
    const tag = toTag(formulaRef)!
    const { container: field } = render(<TagTitle tag={tag} />)
    const { container: selected } = render(
      <OptTargetSelectedLabel formulaRef={formulaRef} />
    )
    expect(selected.textContent).toBe(field.textContent)
  })

  it('uses parsed ability identity, not the raw meta name', async () => {
    const formulaRef = {
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_aftershock0',
      dim: 'standardDmg',
    }
    const { container } = render(
      <OptTargetSelectedLabel formulaRef={formulaRef} />
    )
    await waitFor(() => {
      expect(container.textContent).toContain('UltimateVoidstrike')
    })
    expect(container.textContent).not.toContain('_aftershock')
  })
})
