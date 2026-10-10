import {
  allElementKeys,
  type ElementKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { CondI18nRef } from '../art/artCondI18n'
import { humanizeArtCondName } from '../art/artCondI18n'

export { humanizeArtCondName as humanizeWeaponCondName }

type CondSrc =
  | { wep: string }
  | { sheet: string; values?: Record<string, string | number> }

/** Formula cond name → locale, matching WR `name:` / ZZZ `ch()`. */
const byWeapon: Partial<Record<WeaponKey, Record<string, CondSrc>>> = {
  StaffOfHoma: {
    RecklessCinnabar: { sheet: 'lessPercentHP', values: { percent: 50 } },
  },
}

const byName: Record<string, CondSrc> = {
  stack: { sheet: 'stacks' },
  stacks: { sheet: 'stacks' },
  afterSkill: { sheet: 'afterUse.skill' },
  afterPlunging: { sheet: 'hitOp.plunging' },
  afterDmg: { sheet: 'takeDmg' },
  hpChanges: { sheet: 'hpChange' },
  chargedHit: { sheet: 'hitOp.charged' },
  skillHit: { sheet: 'hitOp.skill' },
  react: { sheet: 'afterReaction' },
}

function isElementKey(val: string): val is ElementKey {
  return (allElementKeys as readonly string[]).includes(val)
}

function weaponOverlayNs(weaponKey: WeaponKey) {
  return `weapon_${weaponKey}`
}

function weaponGenNs(weaponKey: WeaponKey) {
  return weaponKey === 'QuantumCatalyst'
    ? `weapon_${weaponKey}`
    : `weapon_${weaponKey}_gen`
}

function toRef(weaponKey: WeaponKey, src: CondSrc): CondI18nRef {
  if ('wep' in src) return { ns: weaponOverlayNs(weaponKey), key: src.wep }
  return src.values
    ? { ns: 'sheet', key: src.sheet, values: src.values }
    : { ns: 'sheet', key: src.sheet }
}

function patternRefs(name: string): CondI18nRef[] {
  const swirl = /^swirl(.+)$/i.exec(name)
  if (swirl && isElementKey(swirl[1].toLowerCase()))
    return [{ ns: 'sheet', key: `swirlReaction.${swirl[1].toLowerCase()}` }]
  const react = /^react_(.+)$/.exec(name)
  if (react && isElementKey(react[1]))
    return [{ ns: 'sheet', key: `elementalReaction.${react[1]}` }]
  return []
}

/** Unique i18n lookups, ZZZ-style: authored `ch()` then shared `st()`. */
export function weaponCondI18nCandidates(
  weaponKey: WeaponKey,
  name: string
): CondI18nRef[] {
  const wepNs = weaponOverlayNs(weaponKey)
  const refs: CondI18nRef[] = []
  const seen = new Set<string>()
  const add = (ref: CondI18nRef | undefined) => {
    if (!ref) return
    const id = `${ref.ns}:${ref.key}`
    if (seen.has(id)) return
    seen.add(id)
    refs.push(ref)
  }

  const mapped = byWeapon[weaponKey]?.[name]
  if (mapped) add(toRef(weaponKey, mapped))
  for (const ref of patternRefs(name)) add(ref)
  add({ ns: wepNs, key: name })
  if (name === 'passive')
    add({ ns: weaponGenNs(weaponKey), key: 'passiveName' })
  const generic = byName[name]
  if (generic) add(toRef(weaponKey, generic))
  add({ ns: 'sheet', key: name })
  return refs
}
