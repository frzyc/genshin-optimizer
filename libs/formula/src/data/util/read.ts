import { AnyNode, Read, read } from "@genshin-optimizer/waverider";

export const stages = ['base', 'premod', 'final'] as const
export const elements = ['pyro', 'hydro', 'geo', 'cryo', 'electro', 'dendro', 'physical'] as const
export const moves = ['normal', 'charged', 'plunging', 'skill', 'burst', 'elemental'] as const

export const stats = ['hp', 'hp_', 'atk', 'atk_', 'def', 'def_', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_', 'dmg_', 'heal_', 'stamina'] as const
export const charStats = [
  'weaponType', 'lvl', 'special',
  'auto', 'skill', 'burst',
  'constellation', 'ascension',
] as const
export const queries = [...stats, ...charStats, 'cappedCritRate_',
  'dmg', 'defRed_',
  'count', // Team counters
] as const

export const transformativeReactions = ['overloaded', 'shattered', 'electrocharged', 'superconduct', 'swirl', 'burning', 'bloom', 'burgeon', 'hyperbloom'] as const
export const amplifyingReactions = ['vaporize', 'melt'] as const
export const catalyzeReactions = ['spread', 'aggravate'] as const

export const regions = ["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya", "khaenriah"] as const

/*
 * Depending on how tags are added to `BetterRead`, tag categories are separated into two
 * types; common and fixed. If a tag `<cat>:<val>` is fixed, it can be added to existing
 * `BetterRead` using `betterRead.<val>`. If it is common, use `betterRead.cat(<val>)`.
 *
 * Common vs fixed distinction is otherwise not used anywhere else.
 */

const commonCats = ['q', 'char', 'weapon', 'art', 'src', 'name'] as const
const fixedCats = {
  tran: transformativeReactions, amp: amplifyingReactions, cata: catalyzeReactions,
  stage: stages, ele: elements, move: moves, region: regions
} as const
/** Type of common category, if known */
const knownCommonCats = {
  q: queries
} as const
export type Tag =
  { [key in typeof commonCats[number]]?: key extends keyof typeof knownCommonCats ? typeof knownCommonCats[key][number] : string } &
  { [key in keyof typeof fixedCats]?: typeof fixedCats[key][number] }
export type AllTag = Required<Tag>

export type BetterRead = Read & {
  tag: Tag
  with: <C extends keyof Tag>(cat: C, val: AllTag[C], agg?: Read['agg']) => BetterRead
  addNode: (value: AnyNode) => { tag: Tag, value: AnyNode }
  qq: Record<AllTag['q'], BetterRead>
  customQ: Record<string, BetterRead>
} &
  { [key in typeof commonCats[number]]: (val: AllTag[key]) => BetterRead } &
  { [key in typeof fixedCats[keyof typeof fixedCats][number]]: BetterRead }

function makeBetterRead(r: Read): BetterRead {
  function withTag<C extends keyof Tag>(cat: C, val: AllTag[C], agg?: Read['agg']): BetterRead {
    if (!usedTags[cat]) usedTags[cat] = new Set()
    usedTags[cat]!.add(val)
    return makeBetterRead(read({ ...r.tag, [cat]: val }, agg ?? r.agg))
  }
  return Object.defineProperties(r, {
    with: { value: withTag },
    addNode: { value: (value: AnyNode): { tag: Tag, value: AnyNode } => ({ tag: r.tag, value }) },
    qq: { get: () => new Proxy({} as any, { get: (_, p) => withTag('q', p as any) }) },
    customQ: { get: () => new Proxy({} as any, { get: (_, p) => withTag('q', p as any) }) },

    ...Object.fromEntries(commonCats.map(k => [k, { value: (v: any) => withTag(k, v) }])),
    ...Object.fromEntries(Object.entries(fixedCats).flatMap(([k, v]) => v.map(v => [v, { get: () => withTag(k as any, v) }]))),

    // Special overide for `agg`
    base: { get: () => withTag('stage', 'base', 'sum') },
    premod: { get: () => withTag('stage', 'premod', 'sum') },
    final: { get: () => withTag('stage', 'final', 'sum') },
  }) as any
}

export const reader = makeBetterRead(read({}, undefined))
export const todo = makeBetterRead(read({ todo: 'TODO' }, undefined))
export const usedTags: Partial<Record<keyof Tag, Set<string>>> = {}
