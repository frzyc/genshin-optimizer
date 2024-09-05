import type { IBaseConditionalData } from '@genshin-optimizer/common/formula'
import type { StatKey } from '@genshin-optimizer/gi/dm'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpEq,
  cmpNE,
  constant,
  subscript,
} from '@genshin-optimizer/pando/engine'
import type { Member, Sheet, Stat } from './listing'
import type { Read, Tag } from './read'
import { reader, tag } from './read'

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
 * *--------*-----------------------------------------------------*
 * |        |                      Affected By                    |
 * | sheet: *-----------*-----*----------*--------*------*--------*
 * |        | Team Buff | Art | Reaction | Weapon | Char | Custom |
 * *--------*-----------*-----*----------*--------*------*--------*
 * |  agg   |    YES    | YES |   YES    |  YES   | YES  |  YES   |
 * |  iso   |     -     |  -  |    -     |   -    | YES  |  YES   |
 * | static |     -     |  -  |    -     |   -    |  -   |   -    |
 * *--------*-----------*-----*----------*--------*------*--------*
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
  eleMas: agg,
  enerRech_: agg,
  critRate_: agg,
  critDMG_: agg,
  dmg_: agg,
  heal_: agg,
} as const
export const ownTag = {
  base: { atk: agg, def: agg, hp: agg },
  weaponRefinement: { ...stats, shield_: agg },
  premod: { ...stats, shield_: agg },
  final: stats,
  char: {
    lvl: iso,
    ele: iso,
    ascension: iso,
    constellation: iso,
    auto: agg,
    skill: agg,
    burst: agg,
    stamina: agg,
    specialized: iso,
  },
  weapon: {
    lvl: iso,
    refinement: iso,
    ascension: iso,
    primary: agg,
    secondary: agg,
  },
  common: {
    weaponType: iso,
    critMode: fixed,
    cappedCritRate_: fixed,
    count: isoSum,
    eleCount: fixed,
  },
  reaction: {
    infusion: iso,
    infusionIndex: agg,
    ampBase: iso,
    ampMulti: { ...agg, accu: 'prod' },
    transBase: iso,
    transMulti: iso,
    cataBase: iso,
    cataAddi: agg,
    bonus: agg,
  },
  trans: {
    multi: fixed,
    out: fixed,
    cappedCritRate_: fixed,
    critRate_: agg,
    critDMG_: agg,
    critMulti: fixed,
  },
  dmg: { out: fixed, inDmg: fixed, critMulti: fixed },
  prep: { ele: prep, move: prep, amp: prep, cata: prep, trans: prep },
  formula: {
    base: agg,
    dmg: prep,
    shield: prep,
    heal: prep,
    trans: prep,
    transCrit: prep,
    swirl: prep,
  },
  listing: {
    formulas: aggStr,
  },
} as const
export const enemyTag = {
  common: {
    lvl: fixed,
    defRed_: agg,
    defIgn: agg,
    preRes: agg,
    postRes: fixed,
  },
  reaction: { amp: fixed, cata: fixed },
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
export const own = convert(ownTag, { et: 'own', dst: null })
export const team = convert(ownTag, { et: 'team', dst: null, ...noName })
export const target = convert(ownTag, { et: 'target', ...noName })
export const enemy = convert(enemyTag, { et: 'enemy', dst: null, ...noName })

// Default tag DB keys
export const ownBuff = convert(ownTag, { et: 'own' })
export const teamBuff = convert(ownTag, { et: 'teamBuff' })
export const notOwnBuff = convert(ownTag, { et: 'notOwnBuff' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })
export const userBuff = convert(ownTag, { et: 'own', sheet: 'custom' })

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

const condMeta = Symbol.for('condMeta')
type CondIgnored = 'both' | 'src' | 'dst' | 'none'
function allConditionals<T>(
  sheet: Sheet,
  ignored: CondIgnored = 'src',
  meta: IBaseConditionalData,
  transform: (r: Read, q: string) => T
): Record<string, T> {
  // Keep the base tag "full" here so that `cond` returns consistent tags
  const baseTag: Omit<Required<Tag>, 'preset' | 'src' | 'dst' | 'q'> = {
    et: 'own',
    sheet,
    qt: 'cond',
    // Remove irrelevant tags
    name: null,
    region: null,
    ele: null,
    move: null,
    trans: null,
    amp: null,
    cata: null,
    [condMeta as any]: meta, // Add metadata directly to tag
  }
  let base = reader.max.withTag(baseTag)
  if (ignored === 'both') base = base.withTag({ src: null, dst: null })
  else if (ignored !== 'none') base = base.with(ignored, null)
  return base.withAll('q', [], transform)
}

export const queryTypes = new Set([
  ...Object.keys(ownTag),
  ...Object.keys(enemyTag),
  'cond',
  'misc',
  'stackIn',
  'stackTmp',
  'stackOut',
])
// Register `q:`
for (const values of [...Object.values(ownTag), ...Object.values(enemyTag)])
  for (const q of Object.keys(values)) reader.with('q', q)

export function tagToStat(tag: Tag): StatKey {
  return (tag.q === 'dmg_' ? `${tag.ele}_${tag.q}` : tag.q) as StatKey
}
