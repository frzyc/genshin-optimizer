import type { FormulaText } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  artifactsData,
  charData,
  conditionalEntries,
  enemy,
  enemyDebuff,
  formulas,
  genshinCalculatorWithEntries,
  own,
  ownBuff,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { hitMoves } from '@genshin-optimizer/gi/keymap'
import { render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { isValidElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tagFieldSubset } from './char/tagFieldMap'
import { talentSheetElement, talentSheetElementIcon } from './char/util'
import { TagLabel } from './components/TagLabel'
import { FullTagDisplay, TagDisplay } from './components/TagDisplay'
import { formulaText } from './formulaText'
import { getTagLabel, tagTitleColor, warnUnresolvedTagLabel } from './tagLabel'

describe('getTagLabel', () => {
  it('uses listing name for heal/param, not formula.base', () => {
    expect(getTagLabel(formulas.Noelle.skill_heal.tag)).toBe('skill_heal')
    expect(getTagLabel(formulas.Noelle.burst_cd.tag)).toBe('burst_cd')
    expect(getTagLabel(formulas.Noelle.burst.tag)).toBe('burst')
  })

  it('keeps percent() dummy q as "_" for callers that must detect it', () => {
    expect(getTagLabel({ qt: 'misc', q: '_' })).toBe('_')
  })

  it('maps level / DEF / RES pipeline queries onto display keys', () => {
    expect(getTagLabel(own.char.lvl.tag)).toBe('char_lvl')
    expect(getTagLabel(own.weapon.lvl.tag)).toBe('weapon_lvl')
    expect(getTagLabel(enemy.common.lvl.tag)).toBe('enemyLevel')
    expect(getTagLabel(own.dmg.def_mult_.tag)).toBe('enemyDef_multi_')
    expect(getTagLabel(own.final.def.tag)).toBe('def')
    expect(getTagLabel({ ...own.final.atk.tag, ele: 'geo' })).toBe('atk')
    expect(getTagLabel({ ...own.premod.def.tag, ele: 'geo' })).toBe('def')
    expect(getTagLabel({ ...enemy.common.postRes.tag, ele: 'geo' })).toBe(
      'geo_resMulti_'
    )
  })
})

describe('formulaText', () => {
  it('inlines percent() constants instead of listing them as "_"', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const text = formulaText({
      val: 1,
      meta: {
        tag: { qt: 'misc', q: '_' },
        op: 'const',
        ops: [],
        usedCats: new Set(),
        conds: {},
      },
    })
    expect(text.name).toBeUndefined()
    expect(text.formula).toBe('100%')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('labels char/enemy level, DEF, and Geo RES on a Sweeping Time NA hit', () => {
    const char: ICharacter = {
      key: 'Noelle',
      level: 90,
      talent: { auto: 8, skill: 8, burst: 8 },
      ascension: 6,
      constellation: 6,
    }
    const weapon: IWeapon = {
      key: 'RedhornStonethresher',
      level: 90,
      ascension: 6,
      refinement: 5,
      location: 'Noelle',
      lock: false,
    }
    const calc = genshinCalculatorWithEntries([
      ...teamData(['0']),
      ...withMember(
        '0',
        ...charData(char),
        ...weaponData(weapon),
        ...artifactsData([])
      ),
      conditionalEntries('Noelle', '0', null)('SweepingTime', 1),
      enemyDebuff.reaction.cata.add(''),
      enemyDebuff.reaction.amp.add(''),
      enemyDebuff.common.lvl.add(100),
      enemyDebuff.common.preRes.add(0.1),
      ownBuff.common.critMode.add('avg'),
    ]).withTag({ src: '0' })
    const hitRead = calc
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.sheet === 'Noelle' && x.tag.name === 'normal_0')
    expect(hitRead).toBeTruthy()
    const blob = flattenFormula(formulaText(calc.compute(hitRead!)))
    expect(blob).toContain('Character Level')
    expect(blob).toContain('Enemy Level')
    expect(blob).toContain('Enemy DEF Multiplier')
    expect(blob).toContain('Enemy Geo DMG RES Multiplier')
    expect(blob).toContain('ATK')
    expect(blob).toContain('DEF')
  })
})

function flattenFormula(text: FormulaText): string {
  const parts = [nodeText(text.name), nodeText(text.formula)]
  for (const dep of text.deps) parts.push(flattenFormula(dep))
  return parts.join('\n')
}

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  const { container } = render(<>{node}</>)
  return container.textContent ?? ''
}

describe('TagLabel', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('errors instead of rendering "_" as a title', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<TagLabel tag={{ qt: 'misc', q: '_' }} />)
    expect(container.textContent).not.toContain('_')
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0]?.[0]).toMatch(/Unresolved tag label/)
  })

  it('renders Character Level, Enemy Level, DEF, and Geo RES multiplier', () => {
    const charLvl = render(<TagLabel tag={own.char.lvl.tag} />)
    expect(charLvl.container.textContent).toContain('Character Level')
    const enemyLvl = render(<TagLabel tag={enemy.common.lvl.tag} />)
    expect(enemyLvl.container.textContent).toContain('Enemy Level')
    const def = render(<TagLabel tag={own.final.def.tag} />)
    expect(def.container.textContent).toContain('DEF')
    const defMulti = render(<TagLabel tag={own.dmg.def_mult_.tag} />)
    expect(defMulti.container.textContent).toContain('Enemy DEF Multiplier')
    const geoRes = render(
      <TagLabel tag={{ ...enemy.common.postRes.tag, ele: 'geo' }} />
    )
    expect(geoRes.container.textContent).toContain(
      'Enemy Geo DMG RES Multiplier'
    )
  })

  it('errors when warnUnresolvedTagLabel is given a dummy q', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnUnresolvedTagLabel({ qt: 'misc', q: '_' }, '_')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('tagTitleColor', () => {
  it('geo-colors burst from listing ele; infusion autos stay uncolored until compute', () => {
    expect(formulas.Noelle.burst.tag.ele).toBe('geo')
    expect(tagTitleColor(formulas.Noelle.burst.tag)).toBe('geo')
    expect(formulas.Noelle.normal_0.tag.ele).toBeFalsy()
    expect(tagTitleColor(formulas.Noelle.normal_0.tag)).toBeUndefined()
  })
})

describe('tagFieldSubset', () => {
  it('matches authored heal and param fields by listing q', () => {
    expect(tagFieldSubset(formulas.Noelle.skill_heal.tag)[0]?.fieldRef.q).toBe(
      'heal'
    )
    expect(tagFieldSubset(formulas.Noelle.burst_cd.tag)[0]?.fieldRef.q).toBe(
      'param'
    )
  })
})

describe('TagDisplay', () => {
  it('does not title heal or CD tooltips as Base DMG', async () => {
    const heal = render(<TagDisplay tag={formulas.Noelle.skill_heal.tag} />)
    const cd = render(<TagDisplay tag={formulas.Noelle.burst_cd.tag} />)
    await waitFor(() => {
      expect(heal.container.textContent).not.toContain('Base DMG')
      expect(cd.container.textContent).not.toContain('Base DMG')
    })
  })
})

describe('FullTagDisplay', () => {
  it('adds move and element badges from the listing tag', () => {
    const { container } = render(
      <FullTagDisplay tag={formulas.Noelle.burst.tag} />
    )
    expect(container.textContent).toContain(hitMoves.burst)
    expect(container.textContent).toContain('Geo')
  })
})

describe('talentSheetElement', () => {
  it('uses char_gen talent names rather than generic English categories', () => {
    const passive1 = talentSheetElement('Noelle', 'passive1')
    expect(isValidElement(passive1.title)).toBe(true)
    expect(passive1.title).not.toBe('Ascension 1')
    expect(talentSheetElementIcon('Noelle', 'burst')).toBeTruthy()
    expect(talentSheetElementIcon('Noelle', 'auto')).toBeTruthy()
  })
})
