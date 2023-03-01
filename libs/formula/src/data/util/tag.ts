import { constant, NumNode, tag } from '@genshin-optimizer/waverider'
import { Source, Stat } from './listing'
import { Read, Tag } from './read'

export function percent(x: number | NumNode): NumNode {
  return tag(typeof x === 'number' ? constant(x) : x, { q: '_' })
}
export function priorityTable(entries: Record<string, Record<string, number>>, defaultValue = ''): string[] {
  const map = new Map(Object.values(entries).flatMap(entries => Object.entries(entries).map(([k, v]) => [v, k])))
  const max = Math.max(...map.keys()), table: string[] = []
  for (let i = 0; i < max; i++)
    table.push(map.get(i) ?? defaultValue)
  return table
}

/**
 * Possible types of queries:
 *
 * *--------*-----------------------------------------------------*
 * |        |                      Affected By                    |
 * |  Type  *-----------*-----*----------*--------*------*--------*
 * |        | Team Buff | Art | Reaction | Weapon | Char | Custom |
 * *--------*-----------*-----*----------*--------*------*--------*
 * |  agg   |    YES    | YES |   YES    |  YES   | YES  |  YES   |
 * |  iso   |     -     |  -  |    -     |   -    | YES  |  YES   |
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
 */

type Desc = { src: Source | undefined, accu: Read['accu'] }
const aggStr: Desc = { src: 'agg', accu: undefined }
const agg: Desc = { src: 'agg', accu: 'sum' }
const iso: Desc = { src: 'iso', accu: undefined }
const isoSum: Desc = { src: 'iso', accu: 'sum' }
/** `src:`-agnostic calculation */
const fixed: Desc = { src: 'static', accu: undefined }
/** The calculation must have a matching `src:` */
const fixed2: Desc = { src: undefined, accu: undefined }

const stats: Record<Stat, typeof agg> = {
  hp: agg, hp_: agg, atk: agg, atk_: agg, def: agg, def_: agg,
  eleMas: agg, enerRech_: agg, critRate_: agg, critDMG_: agg, dmg_: agg, heal_: agg
} as const
export const selfTag = {
  base: { ...stats, shield_: agg }, premod: stats, final: stats,
  char: {
    lvl: iso, ele: iso, ascension: iso, constellation: iso,
    auto: agg, skill: agg, burst: agg,
    stamina: agg,
  },
  weapon: { lvl: iso, refinement: iso, ascension: iso },
  common: {
    isActive: iso, weaponType: iso, critMode: fixed, special: iso,
    cappedCritRate_: iso, count: isoSum, eleCount: fixed
  },
  reaction: {
    infusion: iso, infusionIndex: agg,
    ampBase: iso, ampMulti: { ...agg, accu: 'prod' },
    transBase: iso, transMulti: iso,
    cataBase: iso, cataAddi: agg,
    bonus: agg,
  },
  trans: { out: fixed, cappedCritRate_: fixed, critRate_: agg, critDMG_: agg, basedCritMulti: fixed, critMulti: iso },
  dmg: { out: fixed, critMulti: fixed },
  prep: { ele: fixed2, move: fixed2, amp: fixed2, cata: fixed2, trans: fixed2 },
  formula: { base: agg, listing: aggStr, prepType: fixed2 },
} as const
export const enemyTag = {
  common: { lvl: fixed, inDmg: fixed, defRed_: agg, defIgn: agg, preRes: agg, postRes: fixed },
  cond: { amp: fixed, cata: fixed },
} as const

export function customQueries(tag: Tag): Record<string, Read> {
  return new Proxy(tag, {
    get(tag, q: string) {
      queries.add(q)
      return new Read({ et: 'self', qt: 'misc', q, ...tag }, undefined)
    }
  }) as any
}
export function convert<V extends Record<string, Record<string, Desc>>>(v: V, tag: Omit<Tag, 'qt' | 'q'>): { [j in keyof V]: { [k in keyof V[j]]: Read } } {
  return Object.fromEntries(Object.entries(v).map(([qt, v]) => [qt, Object.fromEntries(Object.entries(v).map(([q, { src, accu }]) =>
    src ? [q, new Read({ src, qt, q, ...tag }, accu)] : [q, new Read({ qt, q, ...tag }, accu)]
  ))])) as any
}

export const queries = new Set([...Object.values(selfTag), ...Object.values(enemyTag)].flatMap(x => Object.keys(x)))

// Default queries
export const self = convert(selfTag, { et: 'self' })
export const team = convert(selfTag, { et: 'team' })
export const target = convert(selfTag, { et: 'target' })
export const enemy = convert(enemyTag, { et: 'enemy' })

export const allConditionals = (src: Source) => customQueries({ src, qt: 'cond' })
export const allStatics = (src: Source) => customQueries({ src })
export const allStacks = (src: Source): Record<string, { in: Read, out: Read }> => new Proxy(tag, {
  get(tag, q: string) {
    queries.add(q)
    return {
      in: new Read({ src, et: 'stackIn', qt: 'misc', q, ...tag }, undefined),
      out: new Read({ src, et: 'stackOut', qt: 'misc', q, ...tag }, undefined),
    }
  }
}) as any

export const userBuff = convert(selfTag, { et: 'self', src: 'custom' })
export const selfBuff = convert(selfTag, { et: 'self' })
export const teamBuff = convert(selfTag, { et: 'teamBuff' })
export const activeCharBuff = convert(selfTag, { et: 'active' })
export const enemyDebuff = convert(enemyTag, { et: 'enemy' })

export const queryTypes = [...new Set([...Object.keys(selfTag), ...Object.keys(enemyTag), 'misc', 'cond'])]
