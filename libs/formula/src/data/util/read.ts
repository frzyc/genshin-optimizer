import { Read as Base, reread, ReRead } from '@genshin-optimizer/waverider'
import { amplifyingReactions, catalyzeReactions, CharacterStat, CommonQuery, DmgQuery, dsts, elements, EnemyStat, entryTypes, fixedQueries, moves, presets, queryTypes, regions, srcs, Stat, summableQueries, TeamStat, transformativeReactions, WeaponStat } from './listing'

export const fixedTags = {
  preset: presets, et: entryTypes,
  src: srcs, dst: dsts,
  qt: queryTypes,
  region: regions, ele: elements, move: moves,
  tran: transformativeReactions, amp: amplifyingReactions, cata: catalyzeReactions
} as const
export type Tag = {
  [key in keyof typeof fixedTags]?: typeof fixedTags[key][number] | null
} & { name?: string | null, q?: string | null } &
  ( // Permissible queries by query type
    { qt: 'base' | 'premod' | 'final', q: Stat } |
    { qt: 'char', q: CharacterStat } |
    { qt: 'weapon', q: WeaponStat } |
    { qt: 'team', q: TeamStat } |
    { qt: 'enemy', q: EnemyStat } |
    { qt: 'common', q: CommonQuery } |
    { qt: 'dmg', q: DmgQuery } |
    { qt: 'misc', q: string } |
    { qt: null, q: null } |
    { qt?: never, q?: never }
  )
export type AllTag = {
  [key in keyof Tag]-?: Exclude<Tag[key], null>
}

export class Read implements Base {
  op = 'read' as const
  x = []
  br = []
  tag: Tag
  accu: Base['accu']

  constructor(tag: Tag, accu: Read['accu']) {
    this.tag = tag
    this.accu = accu
  }

  with<C extends keyof Tag>(cat: C, val: AllTag[C], accu?: Read['accu']): Read {
    return new Read({ ...this.tag, [cat]: val }, accu ?? this.accu)
  }
  withTag(tag: Omit<Tag, 'name' | 'qt' | 'q'>, accu?: Read['accu']): Read {
    return new Read({ ...this.tag, ...tag }, accu ?? this.accu)
  }
  _withAll<C extends keyof Tag>(cat: C, accu?: Read['accu']): Record<AllTag[C], Read> {
    return new Proxy(this, { get(t, p: AllTag[C]) { return t.with(cat, p, accu) } }) as any
  }
  addNode<V>(value: V): { tag: Tag, value: V } { return { tag: this.tag, value } }
  reread(r: Read): { tag: Tag, value: ReRead } { return { tag: this.tag, value: reread(r.tag) } }

  // Accumulation type
  get sum() { return new Read(this.tag, 'sum') }
  get max() { return new Read(this.tag, 'max') }
  get min() { return new Read(this.tag, 'min') }

  // Queries
  get base() { return this._q<Stat>('base') }
  get premod() { return this._q<Stat>('premod') }
  get final() { return this._q<Stat>('final') }
  get char() { return this._q<CharacterStat>('char') }
  get weapon() { return this._q<WeaponStat>('weapon') }
  get common() { return this._q<CommonQuery>('common') }
  get enemy() { return this._q<EnemyStat>('enemy') }
  get team() { return this._q<TeamStat>('team') }
  get dmg() { return this._q<DmgQuery>('dmg') }
  get custom() { return this._q<string>('misc') }
  _q<V extends AllTag['q']>(qt: AllTag['qt']): Record<V, Read> {
    return new Proxy(this, {
      get(r, q: any) {
        if (qt === 'misc') usedCustomTags.add(q)
        return r.withTag({ qt, q } as any, summableQueries.has(q) ? 'sum' : undefined)
      }
    }) as any
  }
  name(name: string): Read { return usedNames.add(name), this.with('name', name) }

  // Additional Modifiers

  // Move
  get normal(): Read { return this.with('move', 'normal') }
  get charged(): Read { return this.with('move', 'charged') }
  get plunging(): Read { return this.with('move', 'plunging') }
  get skill(): Read { return this.with('move', 'skill') }
  get burst(): Read { return this.with('move', 'burst') }
  get elemental(): Read { return this.with('move', 'elemental') }

  // Element
  get pyro(): Read { return this.with('ele', 'pyro') }
  get hydro(): Read { return this.with('ele', 'hydro') }
  get geo(): Read { return this.with('ele', 'geo') }
  get cryo(): Read { return this.with('ele', 'cryo') }
  get electro(): Read { return this.with('ele', 'electro') }
  get dendro(): Read { return this.with('ele', 'dendro') }
  get physical(): Read { return this.with('ele', 'physical') }

  // Reactions
  get overloaded(): Read { return this.with('tran', 'overloaded') }
  get shattered(): Read { return this.with('tran', 'shattered') }
  get electrocharged(): Read { return this.with('tran', 'electrocharged') }
  get superconduct(): Read { return this.with('tran', 'superconduct') }
  get swirl(): Read { return this.with('tran', 'swirl') }
  get burning(): Read { return this.with('tran', 'burning') }
  get bloom(): Read { return this.with('tran', 'bloom') }
  get burgeon(): Read { return this.with('tran', 'burgeon') }
  get hyperbloom(): Read { return this.with('tran', 'hyperbloom') }
  get vaporize(): Read { return this.with('amp', 'vaporize') }
  get melt(): Read { return this.with('amp', 'melt') }
  get spread(): Read { return this.with('cata', 'spread') }
  get aggravate(): Read { return this.with('cata', 'aggravate') }

  // Region
  get mondstadt(): Read { return this.with('region', 'mondstadt') }
  get liyue(): Read { return this.with('region', 'liyue') }
  get inazuma(): Read { return this.with('region', 'inazuma') }
  get sumeru(): Read { return this.with('region', 'sumeru') }
  get fontaine(): Read { return this.with('region', 'fontaine') }
  get natlan(): Read { return this.with('region', 'natlan') }
  get snezhnaya(): Read { return this.with('region', 'snezhnaya') }
  get khaenriah(): Read { return this.with('region', 'khaenriah') }
}

export const reader = new Read({}, undefined)
export const todo = new Read({ todo: 'TODO' } as {}, undefined)
export const usedCustomTags = new Set<string>()
export const usedNames = new Set<string>()
