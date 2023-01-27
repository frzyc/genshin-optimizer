import { constant, NumNode, tag } from '@genshin-optimizer/waverider'
import { Stat } from './listing'
import { Read, reader, Tag } from './read'

export function percent(x: number | NumNode): NumNode {
  return tag(typeof x === 'number' ? constant(x) : x, percentTag)
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
 * *--------*------------------------------------------------*----------------------*
 * |        |                    Affected By                 |                      |
 * |  Type  *------------------------------------------------*  Default Accumulator |
 * |        | Team Buff | Char/Weapon/Art Self Buff | Preset |                      |
 * *--------*-----------*---------------------------*--------*----------------------*
 * |  agg   |    YES    |           YES             |  YES   |         sum          |
 * | isoSum |     -     |           YES             |  YES   |         sum          |
 * |  iso   |     -     |            -              |  YES   |          -           |
 * *--------*-----------*---------------------------*--------*----------------------*
 */

const stats: Record<Stat, 'agg'> = {
  hp: 'agg', hp_: 'agg', atk: 'agg', atk_: 'agg', def: 'agg', def_: 'agg',
  eleMas: 'agg', enerRech_: 'agg', critRate_: 'agg', critDMG_: 'agg', dmg_: 'agg', heal_: 'agg'
} as const
export const selfTag = {
  base: { ...stats, shield_: 'agg' }, premod: stats, final: stats,
  char: {
    lvl: 'iso', ele: 'iso', ascension: 'iso', constellation: 'iso',
    auto: 'agg', skill: 'agg', burst: 'agg',
    stamina: 'agg',
  },
  weapon: { lvl: 'iso', refinement: 'iso', ascension: 'iso' },
  common: {
    isActive: 'iso', weaponType: 'iso', critMode: 'iso', special: 'iso',
    cappedCritRate_: 'iso', count: 'isoSum', eleCount: 'iso'
  },
  reaction: {
    infusion: 'iso', infusionIndex: 'iso', ampBase: 'iso', ampMulti: 'iso', transBase: 'iso'
  },
  trans: {
    cappedCritRate_: 'iso', critRate_: 'agg', critDMG_: 'agg', critMulti: 'iso',
  },
  preDmg: {
    outDmg: 'iso', critMulti: 'iso',
  },
  dmg: {
    final: 'iso', outDmg: 'iso', base: 'agg', ele: 'iso', move: 'iso', critMulti: 'agg',
  }
} as const
export const enemyTag = {
  common: {
    lvl: 'iso', inDmg: 'iso', defRed_: 'agg', defIgn: 'agg', res: 'agg',
  }
} as const

export function customQueries(tag: Tag): Record<string, Read> {
  return new Proxy(tag, {
    get(tag, q: string) {
      queries.add(q)
      return reader.with('src', 'iso').withTag({ ...tag }).with('qt', 'misc').with('q', q)
    }
  }) as any
}
export function convert<V extends Record<string, Record<string, 'iso' | 'isoSum' | 'agg'>>>(v: V, tag: Omit<Tag, 'qt' | 'q'> & { et: string }): { [j in keyof V]: { [k in keyof V[j]]: Read } } {
  return Object.fromEntries(Object.entries(v).map(([qt, v]) => [qt, Object.fromEntries(Object.entries(v).map(([q, v]) => {
    switch (v) {
      case 'iso': return [q, new Read({ src: 'iso', qt, q, ...tag }, undefined)]
      case 'agg': return [q, new Read({ src: 'agg', qt, q, ...tag }, 'sum')]
      case 'isoSum': return [q, new Read({ src: 'isoSum', qt, q, ...tag }, 'sum')]
    }
  }))])) as any
}

export const queries = new Set([...Object.values(selfTag), ...Object.values(enemyTag)].flatMap(x => Object.keys(x)))
const percentTag = customQueries({})['_'].tag

export const self = { custom: customQueries({ et: 'self' }), ...convert(selfTag, { et: 'self' }) }
export const team = convert(selfTag, { et: 'team' })
export const target = convert(selfTag, { et: 'target' })
export const enemy = convert(enemyTag, { et: 'enemy' })
export const queryTypes = [...new Set([...Object.keys(selfTag), ...Object.keys(enemyTag), 'misc'])]

export type Self = Omit<typeof self, 'custom'>
export type Team = typeof team
export type Enemy = typeof enemy
