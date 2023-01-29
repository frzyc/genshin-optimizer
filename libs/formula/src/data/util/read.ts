import { AnyNode, constant, Read as Base, reread, ReRead } from '@genshin-optimizer/waverider'
import { aggregationType, amplifyingReactions, catalyzeReactions, dsts, elements, entryTypes, moves, presets, regions, Source, srcs, transformativeReactions } from './listing'

export const fixedTags = {
  preset: presets, at: aggregationType, et: entryTypes,
  nameSrc: srcs, src: srcs, dst: dsts,

  region: regions, ele: elements, move: moves,
  trans: transformativeReactions, amp: amplifyingReactions, cata: catalyzeReactions,
} as const
export type Tag = {
  [key in keyof typeof fixedTags]?: typeof fixedTags[key][number] | null
} & { name?: string | null, qt?: string | null, q?: string | null }
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
  withTag(tag: Omit<Tag, 'name' | 'q'>, accu?: Read['accu']): Read {
    return new Read({ ...this.tag, ...tag }, accu ?? this.accu)
  }
  _withAll<C extends keyof Tag>(cat: C, accu?: Read['accu']): Record<AllTag[C], Read> {
    return new Proxy(this, { get(t, p: AllTag[C]) { return t.with(cat, p, accu) } }) as any
  }
  add(value: number | string | AnyNode): { tag: Tag, value: AnyNode } {
    return { tag: this.tag, value: typeof value === 'object' ? value : constant(value) }
  }
  reread(r: Read): { tag: Tag, value: ReRead } { return { tag: this.tag, value: reread(r.tag) } }

  // Accumulator
  get prod() { return new Read(this.tag, 'prod') }
  get sum() { return new Read(this.tag, 'sum') }
  get max() { return new Read(this.tag, 'max') }
  get min() { return new Read(this.tag, 'min') }

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

  // Reaction
  get overloaded(): Read { return this.with('trans', 'overloaded') }
  get shattered(): Read { return this.with('trans', 'shattered') }
  get electrocharged(): Read { return this.with('trans', 'electrocharged') }
  get superconduct(): Read { return this.with('trans', 'superconduct') }
  get swirl(): Read { return this.with('trans', 'swirl') }
  get burning(): Read { return this.with('trans', 'burning') }
  get bloom(): Read { return this.with('trans', 'bloom') }
  get burgeon(): Read { return this.with('trans', 'burgeon') }
  get hyperbloom(): Read { return this.with('trans', 'hyperbloom') }
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
export const usedNames = new Set<string>()
