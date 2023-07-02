import type { NumNode } from '@genshin-optimizer/pando'
import { cmpEq, cmpNE, constant } from '@genshin-optimizer/pando'
import type { Source, Stat } from './listing'
import type { Tag } from './read'
import { Read, reader, tag } from './read'

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
 * |  src:  *-----------*-----*----------*--------*------*--------*
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
 * The correct "final" value of a query must have `src:` be as specified
 * by the corresponding `Desc`. They are treated as a rendezvous point
 * for calculation to gather relevant components. Each of the `src:` here
 * gather different values as shown in the table above. The "gathering"
 * are done by adding appropriate entries, such as `src:agg <= src:custom`
 * in `common/index`. Many of the entries are in either `common/index` or
 * in dynamic util functions, e.g., `src:agg <= src:art` in `artifactsData`,
 * and `src:agg <= src:<team member>` in `teamData`.
 *
 * In effect, `read`ing a `src:agg` entry will include contributions from
 * team member, weapon, custom values, etc., while `read`ing a `src:iso` only
 * include contributions from character and custom values.
 */

type Desc = { src: Source | undefined; accu: Read['accu'] }
const aggStr: Desc = { src: 'agg', accu: undefined }
const agg: Desc = { src: 'agg', accu: 'sum' }
const iso: Desc = { src: 'iso', accu: undefined }
const isoSum: Desc = { src: 'iso', accu: 'sum' }
/** `src:`-agnostic calculation */
const fixed: Desc = { src: 'static', accu: undefined }
/** The calculation must have a matching `src:` */
const prep: Desc = { src: undefined, accu: undefined }

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
  base: { ...stats, shield_: agg },
  premod: stats,
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
    isActive: iso,
    weaponType: iso,
    critMode: fixed,
    special: iso,
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
    listing: aggStr,
    dmg: prep,
    shield: prep,
    heal: prep,
    trans: prep,
    transCrit: prep,
    swirl: prep,
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
  cond: { amp: fixed, cata: fixed },
} as const

export function convert<V extends Record<string, Record<string, Desc>>>(
  v: V,
  tag: Omit<Tag, 'qt' | 'q'>
): { [j in keyof V]: { [k in keyof V[j]]: Read } } {
  return Object.fromEntries(
    Object.entries(v).map(([qt, v]) => [
      qt,
      Object.fromEntries(
        Object.entries(v).map(([q, { src, accu }]) =>
          src
            ? [q, new Read({ src, qt, q, ...tag }, accu)]
            : [q, new Read({ qt, q, ...tag }, accu)]
        )
      ),
    ])
  ) as any
}

// For tag key compilation
export const queries = new Set(
  [...Object.values(selfTag), ...Object.values(enemyTag)].flatMap((x) =>
    Object.keys(x)
  )
)
export const queryTypes = new Set([
  ...Object.keys(selfTag),
  ...Object.keys(enemyTag),
  'cond',
  'misc',
  'stackIn',
  'stackInt',
  'stackOut',
])

// Default queries
export const self = convert(selfTag, { et: 'self' })
export const team = convert(selfTag, { et: 'team' })
export const target = convert(selfTag, { et: 'target' })
export const enemy = convert(enemyTag, { et: 'enemy' })

// Default tag DB keys
export const selfBuff = convert(selfTag, { et: 'self' })
export const teamBuff = convert(selfTag, { et: 'teamBuff' })
export const activeCharBuff = convert(selfTag, { et: 'active' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })
export const userBuff = convert(selfTag, { et: 'self', src: 'custom' })

// Custom tags
export const allConditionals = (
  src: Source,
  accu: Read['accu'] | 'none' = 'sum'
) => allCustoms(src, 'cond', accu !== 'none' ? reader[accu] : reader)
export const allStatics = (src: Source) => allCustoms(src, 'misc')
export const allStacks = (
  src: Source
): Record<string, { in: Read; out: Read }> => {
  const i = allCustoms(src, 'stackIn')
  const o = allCustoms(src, 'stackOut')
  return new Proxy(
    {},
    {
      get: (_, q: string) => ({ in: i[q], out: o[q] }),
    }
  ) as any
}

type BoolConditional = {
  ifOn: (on: NumNode | number, off?: NumNode | number) => NumNode
  ifOff: (off: NumNode | number) => NumNode
}
export const allBoolConditionals = (
  src: Source
): Record<string, BoolConditional> =>
  new Proxy(reader.sum.withTag({ et: 'self', src, qt: 'cond' })._withAll('q'), {
    get: (dict, q: string) => {
      queries.add(q)
      const cond = dict[q]
      return {
        ifOn: (node: NumNode | number, off?: NumNode | number) =>
          cmpNE(cond, 0, node, off),
        ifOff: (node: NumNode | number) => cmpEq(cond, 0, node),
      }
    },
  }) as any

function allCustoms(
  src: Source,
  qt: string,
  r: Read = reader
): Record<string, Read> {
  return new Proxy(r.withTag({ et: 'self', src, qt })._withAll('q'), {
    get: (dict, q: string) => (queries.add(q), dict[q]),
  })
}
