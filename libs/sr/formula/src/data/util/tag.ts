import { objKeyMap } from '@genshin-optimizer/common/util'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpEq,
  cmpNE,
  constant,
  subscript,
} from '@genshin-optimizer/pando/engine'
import type { Member, Sheet, Stat } from './listing'
import { bonusAbilities, statBoosts } from './listing'
import type { Read, Tag } from './read'
import { reader, tag } from './read'

export const metaList: {
  conditionals?: { tag: Tag; meta: object }[]
} = {}

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

type Desc = { sheet: Sheet | undefined; accu: Read['accu'] }
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
  brEff_: agg,
  eff_: agg,
  eff_res_: agg,
  enerRegen_: agg,
  heal_: agg,
  dmg_: agg,
  resPen_: agg,
  weakness_: agg,
} as const
export const selfTag = {
  base: { atk: agg, def: agg, hp: agg, spd: agg },
  premod: { ...stats, shield_: agg },
  final: stats,
  char: {
    lvl: iso,
    ele: iso,
    path: iso,
    ascension: iso,
    eidolon: iso,
    basic: agg,
    skill: agg,
    ult: agg,
    talent: agg,
    ...objKeyMap(bonusAbilities, () => isoSum),
    ...objKeyMap(statBoosts, () => isoSum),
  },
  lightCone: { lvl: iso, ascension: iso, superimpose: iso },
  common: {
    count: isoSum,
    path: iso,
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
    formulas: aggStr,
  },
} as const
export const enemyTag = {
  common: {
    lvl: fixed,
    defRed_: agg,
    defIgn_: agg,
    res: agg,
    maxToughness: iso,
    isBroken: iso,
  },
} as const

export function convert<V extends Record<string, Record<string, Desc>>>(
  v: V,
  tag: Omit<Tag, 'qt' | 'q'>
): {
  [j in 'withTag' | keyof V]: j extends 'withTag'
    ? (_: Tag) => Read
    : { [k in keyof V[j]]: Read }
} {
  const r = reader.withTag(tag)
  return r.withAll(
    'qt',
    Object.keys(v),
    (r, qt) =>
      r.withAll('q', Object.keys(v[qt]), (r, q) => {
        if (!v[qt][q]) console.error(`Invalid { qt:${qt} q:${q} }`)
        const { sheet, accu } = v[qt][q]
        // `tag.sheet` overrides `Desc`
        if (sheet && !tag.sheet) r = r.sheet(sheet)
        return r[accu]
      }),
    { withTag: (tag: Tag) => r.withTag(tag) }
  ) as any
}

// Default queries
const noName = { src: null, name: null }
export const own = convert(selfTag, { et: 'own', dst: null })
export const team = convert(selfTag, { et: 'team', dst: null, ...noName })
export const target = convert(selfTag, { et: 'target', ...noName })
export const enemy = convert(enemyTag, { et: 'enemy', dst: null, ...noName })

// Default tag DB keys
export const ownBuff = convert(selfTag, { et: 'own' })
export const teamBuff = convert(selfTag, { et: 'teamBuff' })
export const notSelfBuff = convert(selfTag, { et: 'notSelfBuff' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })
export const userBuff = convert(selfTag, { et: 'own', sheet: 'custom' })

// Custom tags
export const allStatics = (sheet: Sheet) =>
  reader.withTag({ et: 'own', sheet, qt: 'misc' }).withAll('q', [])
export const allBoolConditionals = (sheet: Sheet, ignored?: CondIgnored) =>
  allConditionals(sheet, ignored, { type: 'bool' }, (r) => ({
    ifOn: (node: NumNode | number, off?: NumNode | number) =>
      cmpNE(r, 0, node, off),
    ifOff: (node: NumNode | number) => cmpEq(r, 0, node),
  }))
export const allListConditionals = <T extends string>(
  sheet: Sheet,
  list: T[],
  ignored?: CondIgnored
) =>
  allConditionals(sheet, ignored, { type: 'list', list }, (r) => ({
    map: (table: Record<T, number>, def = 0) =>
      subscript(r, [def, ...list.map((v) => table[v] ?? def)]),
    value: r,
  }))
export const allNumConditionals = (
  sheet: Sheet,
  int_only = true,
  min?: number,
  max?: number,
  ignored?: CondIgnored
) =>
  allConditionals(sheet, ignored, { type: 'num', int_only, min, max }, (r) => r)

type MemAll = Member | 'all'
export const conditionalEntries = (sheet: Sheet, src: MemAll, dst: MemAll) => {
  let tag: Tag = { sheet, qt: 'cond' }
  if (src !== 'all') tag = { ...tag, src }
  if (dst !== 'all') tag = { ...tag, dst }
  const base = own.withTag(tag).withAll('q', [])
  return (name: string, val: string | number) => base[name].add(val)
}

type CondIgnored = 'both' | 'src' | 'dst' | 'none'
function allConditionals<T>(
  sheet: Sheet,
  shared: CondIgnored = 'src',
  meta: object,
  transform: (r: Read, q: string) => T
): Record<string, T> {
  // Keep the base tag "full" here so that `cond` returns consistent tags
  const baseTag: Omit<Required<Tag>, 'preset' | 'src' | 'dst' | 'q'> = {
    et: 'own',
    sheet,
    qt: 'cond',
    // Remove irrelevant tags
    name: null,
    elementalType: null,
    damageType1: null,
    damageType2: null,
  }
  let base = reader.max.withTag(baseTag)
  if (shared === 'both') base = base.withTag({ src: null, dst: null })
  else if (shared !== 'none') base = base.with(shared, null)
  if (metaList.conditionals) {
    const { conditionals } = metaList
    return base.withAll('q', [], (r, q) => {
      const tag = Object.fromEntries(
        Object.entries(r.tag).filter(([_, v]) => v)
      )
      conditionals.push({ meta, tag })
      return transform(r, q)
    })
  }
  return base.withAll('q', [], transform)
}

export const queryTypes = new Set([
  ...Object.keys(selfTag),
  ...Object.keys(enemyTag),
  'cond',
  'misc',
  'stackIn',
  'stackTmp',
  'stackOut',
])

// Register q:
for (const values of [...Object.values(selfTag), ...Object.values(enemyTag)])
  for (const q of Object.keys(values)) reader.register('q', q)
