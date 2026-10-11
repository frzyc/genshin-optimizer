import type { Tag } from '@genshin-optimizer/zzz/formula'
import { formulaCatalog } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AbilityRowTitle } from './abilityFormulaLabels'

const anbyTurboVoltHit3 =
  formulaCatalog.Anby.BasicAttackTurboVolt_3.dims.standardDmg

const s0AnbyAftershockUlt =
  formulaCatalog.Soldier0Anby.UltimateVoidstrike_aftershock0.dims.standardDmg

const s0AnbyUltHit0 =
  formulaCatalog.Soldier0Anby.UltimateVoidstrike_0.dims.standardDmg

function rowText(tag: Tag): string {
  const { container } = render(<AbilityRowTitle tag={tag} />)
  return container.textContent ?? ''
}

function mockBlankUltimateVoidstrikeParam() {
  return vi.spyOn(i18n, 't').mockImplementation((key, opts) => {
    if (
      typeof key === 'string' &&
      key === 'chain.UltimateVoidstrike.params.0'
    ) {
      return ' '
    }
    const options = opts as { defaultValue?: string } | undefined
    return options?.defaultValue ?? key
  })
}

describe('AbilityRowTitle', () => {
  it('uses hit-specific param labels for multi-hit abilities', () => {
    const hitLabel = rowText(anbyTurboVoltHit3)
    const baseLabel = rowText({
      ...anbyTurboVoltHit3,
      name: 'BasicAttackTurboVolt',
    })
    expect(hitLabel).toBeTruthy()
    expect(baseLabel).toBe('BasicAttackTurboVolt')
    expect(hitLabel).not.toBe(baseLabel)
  })

  it('shows the parent ability name for aftershock suffix hits, not the raw meta name', () => {
    expect(rowText(s0AnbyAftershockUlt)).toBe('UltimateVoidstrike')
    expect(rowText(s0AnbyAftershockUlt)).not.toContain('_aftershock')
  })

  it('falls back to ability name when hit param text is blank', () => {
    mockBlankUltimateVoidstrikeParam()

    expect(rowText(s0AnbyUltHit0)).toBe('UltimateVoidstrike')

    vi.restoreAllMocks()
  })

  it('falls back to abilityKey when ability name is not translated', () => {
    expect(
      rowText({
        ...anbyTurboVoltHit3,
        name: 'UnknownAbilityName',
      })
    ).toBe('UnknownAbilityName')
  })
})
