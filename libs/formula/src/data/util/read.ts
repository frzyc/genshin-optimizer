import { Read, reread, ReRead } from "@genshin-optimizer/waverider";

export const presets = ['preset0', 'preset1', 'preset2', 'preset3', 'preset4', 'preset5', 'preset6', 'preset7', 'preset8', 'preset9'] as const
export const stages = ['base', 'premod', 'final'] as const
export const elements = ['pyro', 'hydro', 'geo', 'cryo', 'electro', 'dendro', 'physical'] as const
export const moves = ['normal', 'charged', 'plunging', 'skill', 'burst', 'elemental'] as const

export const stats = ['hp', 'hp_', 'atk', 'atk_', 'def', 'def_', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_', 'dmg_', 'heal_', 'stamina'] as const
export const summableQueries = [...stats, 'auto', 'skill', 'burst', 'constellation', 'ascension', 'defRed_', 'count'] as const
export const queries = [...summableQueries, 'weaponType', 'lvl', 'hitMode', 'special', 'cappedCritRate_', 'dmg'] as const

export const characters = ['Nahida'] as const // TODO
export const weapons = [] as const // TODO
export const arts = [] as const // TODO
export const srcs = [...characters, ...weapons, ...arts, 'art', 'char', 'weapon', 'team', 'enemy', 'custom', 'none'] as const
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

export const fixedCats = {
  q: queries, src: srcs, stage: stages, region: regions,
  preset: presets, ele: elements, move: moves,
  tran: transformativeReactions, amp: amplifyingReactions, cata: catalyzeReactions,
} as const
export type Tag = { [key in keyof typeof fixedCats]?: typeof fixedCats[key][number] }
export type AllTag = Required<Tag>

export class BetterRead implements Read {
  op = 'read' as const
  x = []
  br = []
  tag: Tag
  agg: Read['agg']

  constructor(tag: Tag, agg: Read['agg']) {
    this.tag = tag
    this.agg = agg
  }

  with<C extends keyof Tag>(cat: C, val: AllTag[C], agg?: Read['agg']): BetterRead {
    return new BetterRead({ ...this.tag, [cat]: val }, agg ?? this.agg)
  }
  withAll<C extends keyof Tag>(cat: C, agg?: Read['agg']): Record<AllTag[C], BetterRead> {
    return new Proxy(this, { get(t, q: AllTag[C]) { return t.with(cat, q, agg) } }) as any
  }
  withTag(tag: Tag, agg?: Read['agg']): BetterRead {
    return new BetterRead({ ...this.tag, ...tag }, agg ?? this.agg)
  }
  addNode<V>(value: V): { tag: Tag, value: V } { return { tag: this.tag, value } }
  reread(r: BetterRead): { tag: Tag, value: ReRead } { return { tag: this.tag, value: reread(r.tag) } }

  get custom(): Record<string, BetterRead> {
    return new Proxy(this, { get(t, q: typeof queries[number]) { return usedCustomTags.add(q), t.withTag({ q, stage: 'base' }) } }) as any
  }
  get q(): Record<Exclude<typeof queries[number], typeof summableQueries[number]>, BetterRead> {
    return new Proxy(this, { get(t, q: typeof queries[number]) { return t.withTag({ q, stage: 'base' }) } }) as any
  }
  get base(): Record<typeof summableQueries[number], BetterRead> {
    return new Proxy(this, { get(t, q: typeof stats[number]) { return t.withTag({ q, stage: 'base' }, 'sum') } }) as any
  }
  get premod(): Record<typeof stats[number], BetterRead> {
    return new Proxy(this, { get(t, q: typeof stats[number]) { return t.withTag({ q, stage: 'premod' }, 'sum') } }) as any
  }
  get final(): Record<typeof stats[number], BetterRead> {
    return new Proxy(this, { get(t, q: typeof stats[number]) { return t.withTag({ q, stage: 'final' }, 'sum') } }) as any
  }

  preset = (n: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, agg?: Read['agg']) => this.with('preset', `preset${n}`, agg)
  src = (src: typeof srcs[number], agg?: Read['agg']) => this.with('src', src, agg)

  // Reactions
  get overloaded(): BetterRead { return this.with('tran', 'overloaded') }
  get shattered(): BetterRead { return this.with('tran', 'shattered') }
  get electrocharged(): BetterRead { return this.with('tran', 'electrocharged') }
  get superconduct(): BetterRead { return this.with('tran', 'superconduct') }
  get swirl(): BetterRead { return this.with('tran', 'swirl') }
  get burning(): BetterRead { return this.with('tran', 'burning') }
  get bloom(): BetterRead { return this.with('tran', 'bloom') }
  get burgeon(): BetterRead { return this.with('tran', 'burgeon') }
  get hyperbloom(): BetterRead { return this.with('tran', 'hyperbloom') }
  get vaporize(): BetterRead { return this.with('amp', 'vaporize') }
  get melt(): BetterRead { return this.with('amp', 'melt') }
  get spread(): BetterRead { return this.with('cata', 'spread') }
  get aggravate(): BetterRead { return this.with('cata', 'aggravate') }
}

export const reader = new BetterRead({}, undefined)
export const todo = new BetterRead({ todo: 'TODO' } as {}, undefined)
export const usedCustomTags = new Set<string>()
