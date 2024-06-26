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
export const selfTag = {
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
  },
  weapon: { lvl: iso, refinement: iso, ascension: iso },
  common: {
    weaponType: iso,
    critMode: fixed,
    cappedCritRate_: iso,
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
  dmg: { out: fixed, critMulti: fixed },
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
    specialized: aggStr,
  },
} as const
export const enemyTag = {
  common: {
    lvl: fixed,
    inDmg: fixed,
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
export const self = convert(selfTag, { et: 'self', dst: null })
export const team = convert(selfTag, { et: 'team', dst: null, src: null })
export const target = convert(selfTag, { et: 'target', src: null })
export const enemy = convert(enemyTag, { et: 'enemy' })

// Default tag DB keys
export const selfBuff = convert(selfTag, { et: 'selfBuff' })
export const teamBuff = convert(selfTag, { et: 'teamBuff' })
export const notSelfBuff = convert(selfTag, { et: 'notSelfBuff' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })
export const userBuff = convert(selfTag, { et: 'self', sheet: 'custom' })

// Custom tags
export const allStatics = (sheet: Sheet) =>
  reader.withTag({ et: 'self', sheet, qt: 'misc' }).withAll('q', [])
export const allBoolConditionals = (sheet: Sheet, shared?: boolean) =>
  allConditionals(sheet, shared, { type: 'bool' }, (r) => ({
    ifOn: (node: NumNode | number, off?: NumNode | number) =>
      cmpNE(r, 0, node, off),
    ifOff: (node: NumNode | number) => cmpEq(r, 0, node),
  }))
export const allListConditionals = <T extends string>(
  sheet: Sheet,
  list: T[],
  shared?: boolean
) =>
  allConditionals(sheet, shared, { type: 'list', list }, (r) => ({
    map: (table: Record<T, number>, def = 0) => {
      subscript(
        r,
        list.map((v) => table[v] ?? def)
      )
    },
    value: r,
  }))
export const allNumConditionals = (
  sheet: Sheet,
  int_only = true,
  min?: number,
  max?: number,
  shared?: boolean
) =>
  allConditionals(sheet, shared, { type: 'num', int_only, min, max }, (r) => r)

export const conditionalEntries = (sheet: Sheet, src: Member, dst: Member) => {
  const base = self.withTag({ src, dst, sheet, qt: 'cond' }).withAll('q', [])
  return (name: string, val: string | number) => base[name].add(val)
}

function allConditionals<T>(
  sheet: Sheet,
  shared = true,
  meta: object,
  transform: (r: Read, q: string) => T
): Record<string, T> {
  // Keep the base tag "full" here so that `cond` returns consistent tags
  const baseTag: Omit<Required<Tag>, 'preset' | 'src' | 'dst' | 'q'> = {
    et: 'self',
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
  }
  let base = reader.sum.withTag(baseTag)
  if (shared) base = base.with('src', 'all')
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
  'stack',
])
// Register `q:`
for (const values of [...Object.values(selfTag), ...Object.values(enemyTag)])
  for (const q of Object.keys(values)) reader.with('q', q)
