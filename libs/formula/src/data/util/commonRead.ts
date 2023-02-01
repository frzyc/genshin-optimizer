import { constant, NumNode, tag } from '@genshin-optimizer/waverider'
import { Data } from '.'
import { Source, Stat } from './listing'
import { AllTag, Read, Tag } from './read'

export function percent(x: number | NumNode): NumNode {
  return tag(typeof x === 'number' ? constant(x) : x, { q: '_' })
}
export function priorityTable<T extends Record<string, Record<string, number>>>(entries: T, defaultValue = ''): string[] {
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
 * |        | Team Buff | Art | Reaction | Weapon | Char | Preset |
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
 *   <qt>: {
 *     <q>: Desc
 *   }
 * }
 */

type Desc = { src: AllTag['src'], accu: Read['accu'] }
const agg: Desc = { src: 'agg', accu: 'sum' }
const iso: Desc = { src: 'iso', accu: undefined }
const isoSum: Desc = { src: 'iso', accu: 'sum' }
const fixed: Desc = { src: 'static', accu: undefined }

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
  trans: { cappedCritRate_: fixed, critRate_: agg, critDMG_: agg, critMulti: iso },
  preDmg: { outDmg: fixed, critMulti: fixed },
  prep: { ele: fixed, move: fixed, amp: fixed, cata: fixed, trans: fixed },
  formula: { outDmg: iso, base: agg },
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
  return Object.fromEntries(Object.entries(v).map(([qt, v]) => [qt, Object.fromEntries(Object.entries(v).map(([q, { src, accu }]) => {
    return [q, new Read({ src, qt, q, ...tag }, accu)]
  }))])) as any
}

export const queries = new Set([...Object.values(selfTag), ...Object.values(enemyTag)].flatMap(x => Object.keys(x)))

export function register(src: Source, ...data: Data): Data {
  return data.map(({ tag, value }) => {
    if (tag.name) tag = { ...tag, nameSrc: src }
    else tag = { ...tag, src }
    return { tag, value }
  })
}

// Default queries
export const self = convert(selfTag, { et: 'self' })
export const team = convert(selfTag, { et: 'team' })
export const target = convert(selfTag, { et: 'target' })
export const enemy = convert(enemyTag, { et: 'enemy' })

export const custom = (src: Source) => customQueries({ src })
export const stack = (src: Source): Record<string, { in: Read, out: Read }> => new Proxy(tag, {
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

export const queryTypes = [...new Set([...Object.keys(selfTag), ...Object.keys(enemyTag), 'misc'])]

export type Self = typeof self
export type Team = typeof team
export type Enemy = typeof enemy
export type Custom = typeof custom
