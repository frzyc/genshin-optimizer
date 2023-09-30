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

type Desc = { src: Source | undefined; accu: Read['ex'] }
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
  atk: agg,
  def: agg,
  spd: agg,
  crit_: agg,
  crit_dmg_: agg,
  taunt: agg,
} as const
export const selfTag = {
  stat: stats,
  char: {
    lvl: iso,
    ele: iso,
    ascension: iso,
    eidolon: iso,
  },
  lightcone: { lvl: iso, ascension: iso, superimposition: iso },
  common: {
    isActive: iso,
    weaponType: iso,
    critMode: fixed,
    special: iso,
    cappedCritRate_: iso,
    count: isoSum,
    eleCount: fixed,
  },
  dmg: { out: fixed, critMulti: fixed },
  prep: { ele: prep, move: prep },
  formula: {
    base: agg,
    listing: aggStr,
    dmg: prep,
    shield: prep,
    heal: prep,
  },
} as const
export const enemyTag = {
  common: {
    lvl: fixed,
    inDmg: fixed,
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

// Default queries
export const self = convert(selfTag, { et: 'self' })
export const team = convert(selfTag, { et: 'team' })
export const target = convert(selfTag, { et: 'target' })
export const enemy = convert(enemyTag, { et: 'enemy' })

// Default tag DB keys
export const selfBuff = convert(selfTag, { et: 'self' })
export const teamBuff = convert(selfTag, { et: 'teamBuff' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })
export const userBuff = convert(selfTag, { et: 'self', src: 'custom' })

// Custom tags
export const allStatics = (src: Source) => allCustoms(src, 'misc', (x) => x)
export const allConditionals = (src: Source, accu: Read['accu'] = 'sum') =>
  allCustoms(src, 'cond', (r) => r[accu])
export const allStacks = (src: Source) =>
  allCustoms(src, 'stackOut', (out) => ({
    in: out.with('qt', 'stackIn'),
    out,
  }))
export const allBoolConditionals = (src: Source) =>
  allCustoms(src, 'cond', ({ sum: r }) => ({
    ifOn: (node: NumNode | number, off?: NumNode | number) =>
      cmpNE(r, 0, node, off),
    ifOff: (node: NumNode | number) => cmpEq(r, 0, node),
  }))

function allCustoms<T>(
  src: Source,
  qt: string,
  transform: (r: Read, q: string) => T
): Record<string, T> {
  return reader.withTag({ et: 'self', src, qt }).withAll('q', [], transform)
}

export const queryTypes = new Set([
  ...Object.keys(selfTag),
  ...Object.keys(enemyTag),
  'cond',
  'misc',
  'stackIn',
  'stackInt',
  'stackOut',
])

// Register q:
for (const values of [...Object.values(selfTag), ...Object.values(enemyTag)])
  for (const q of Object.keys(values)) reader.register('q', q)
