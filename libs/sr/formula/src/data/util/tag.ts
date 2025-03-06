import { objKeyMap } from '@genshin-optimizer/common/util'
import type { Desc as BaseDesc } from '@genshin-optimizer/game-opt/engine'
import {
  createAllBoolConditionals,
  createAllListConditionals,
  createAllNumConditionals,
  createConditionalEntries,
  createConvert,
  tag,
} from '@genshin-optimizer/game-opt/engine'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import { constant } from '@genshin-optimizer/pando/engine'
import type { Sheet, Stat } from './listing'
import { bonusAbilities, statBoosts } from './listing'
import type { Read, Tag } from './read'
import { reader } from './read'

export function percent(x: number | NumNode): NumNode {
  return tag(typeof x === 'number' ? constant(x) : x, { qt: 'misc', q: '_' })
}
export function priorityTable(
  entries: Record<string, Record<string, number>>,
  defaultValue = ''
): string[] {
  const map = new Map(
    Object.values(entries).flatMap((entries) =>
      Object.entries(entries).map(([k, v]) => [v, k])
    )
  )
  const max = Math.max(...map.keys()),
    table: string[] = []
  for (let i = 0; i < max; i++) table.push(map.get(i) ?? defaultValue)
  return table
}

/**
 * Possible types of queries:
 *
 * *--------*-----------------------------------------------------------*
 * |        |                       Affected By                         |
 * | sheet: *-----------*------*----------*-------------*------*--------*
 * |        | Team Buff | Relic | Reaction | Light Cone | Char | Custom |
 * *--------*-----------*-------*----------*------------*------*--------*
 * |  agg   |    YES    |  YES  |   YES    |    YES     | YES  |  YES   |
 * |  iso   |     -     |   -   |    -     |     -      | YES  |  YES   |
 * | static |     -     |   -   |    -     |     -      |  -   |   -    |
 * *--------*-----------*-------*----------*------------*------*--------*
 *
 * Entries below list queries in the following format:
 *
 * ```
 * <tag list> = {
 *   <query type>: {
 *     <query>: Desc
 *   }
 * }
 *
 * The correct "final" value of a query must have `sheet:` be as specified
 * by the corresponding `Desc`. They are treated as a rendezvous point for
 * calculation to gather relevant components. Each of the `sheet:` here gather
 * different values as shown in the table above. The "gathering" are done by
 * adding appropriate entries, such as `sheet:agg <= sheet:custom` in
 * `common/index`. Many of the entries are in either `common/index` or in
 * dynamic util functions, e.g., `sheet:agg <= sheet:art` in `artifactsData`,
 * and `sheet:agg <= src:<team member>` in `teamData`.
 *
 * In effect, `read`ing a `sheet:agg` entry will include contributions from
 * team member, weapon, custom values, etc., while `read`ing a `sheet:iso`
 * only include contributions from character and custom values.
 */

type Desc = BaseDesc<Sheet>
const aggStr: Desc = { sheet: 'agg', accu: 'unique' }
const agg: Desc = { sheet: 'agg', accu: 'sum' }
const iso: Desc = { sheet: 'iso', accu: 'unique' }
const isoSum: Desc = { sheet: 'iso', accu: 'sum' }
/** `sheet:`-agnostic calculation */
const fixed: Desc = { sheet: 'static', accu: 'unique' }
/** The calculation must have a matching `sheet:` */
const prep: Desc = { sheet: undefined, accu: 'unique' }

const stats: Record<Stat, Desc> = {
  hp: agg,
  hp_: agg,
  atk: agg,
  atk_: agg,
  def: agg,
  def_: agg,
  spd: agg,
  spd_: agg,
  crit_: agg,
  crit_dmg_: agg,
  brEffect_: agg,
  eff_: agg,
  eff_res_: agg,
  enerRegen_: agg,
  heal_: agg,
  incHeal_: agg,
  dmg_: agg,
  resPen_: agg,
  defIgn_: agg,
  common_dmg_: agg,
  weakness_: agg,
  brEfficiency_: agg,
} as const
export const ownTag = {
  base: { atk: agg, def: agg, hp: agg, spd: agg },
  premod: { ...stats, shield_: agg },
  final: stats,
  char: {
    lvl: iso,
    ele: iso,
    path: iso,
    ascension: iso,
    teamPosition: iso,
    eidolon: iso,
    maxEnergy: iso,
    basic: agg,
    skill: agg,
    ult: agg,
    talent: agg,
    servantSkill: agg,
    servantTalent: agg,
    ...objKeyMap(bonusAbilities, () => isoSum),
    ...objKeyMap(statBoosts, () => isoSum),
  },
  lightCone: { lvl: iso, ascension: iso, superimpose: isoSum },
  common: {
    count: isoSum,
    critMode: fixed,
    cappedCrit_: iso,
  },
  dmg: { out: fixed, inDmg: fixed, critMulti: fixed },
  formula: {
    base: agg,
    listing: aggStr,
    dmg: prep,
    shield: prep,
    heal: prep,
    breakDmg: prep,
  },
  listing: {
    // Anything that is intended to be allowed as an optimization target.
    formulas: aggStr,
    // Flat buffs that don't scale off of a stat.
    buffs: aggStr,
  },
} as const
export const enemyTag = {
  common: {
    lvl: fixed,
    defRed_: agg,
    res: agg,
    maxToughness: iso,
    isBroken: iso,
  },
} as const

export const convert = createConvert<Read>()

// Default queries
const noName = { src: null, name: null }
export const own = convert(ownTag, {
  et: 'own',
  dst: null,
})
// `semiOwn` retains `dst`, so this can calculate a buff
// that comes from charA (`own`) but scales off charB stats (`target`)
export const semiOwn = convert(ownTag, {
  et: 'own',
})
export const team = convert(ownTag, {
  et: 'team',
  dst: null,
  ...noName,
})
export const target = convert(ownTag, { et: 'target', ...noName })
export const enemy = convert(enemyTag, { et: 'enemy', dst: null, ...noName })

// Default tag DB keys
export const ownBuff = convert(ownTag, { et: 'own' })
export const semiOwnBuff = ownBuff
export const teamBuff = convert(ownTag, { et: 'teamBuff' })
export const notOwnBuff = convert(ownTag, { et: 'notOwnBuff' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })
export const userBuff = convert(ownTag, { et: 'own', sheet: 'custom' })

// Custom tags
const nullTag: Tag = {
  name: null,
  elementalType: null,
  damageType1: null,
  damageType2: null,
}
export const allStatics = (sheet: Sheet) =>
  reader.withTag({ et: 'own', sheet, qt: 'misc' }).withAll('q', [])
export const allBoolConditionals = createAllBoolConditionals(nullTag)
export const allListConditionals = createAllListConditionals(nullTag)
export const allNumConditionals = createAllNumConditionals(nullTag)
export const conditionalEntries = createConditionalEntries(own)

export const queryTypes = new Set([
  ...Object.keys(ownTag),
  ...Object.keys(enemyTag),
  'cond',
  'misc',
  'stackIn',
  'stackTmp',
  'stackOut',
])

// Register q:
for (const values of [...Object.values(ownTag), ...Object.values(enemyTag)])
  for (const q of Object.keys(values)) reader.register('q', q)
