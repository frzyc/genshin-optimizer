import {
  allAmplifyingReactionKeys,
  allCatalyzeReactionKeys,
  allElementWithPhyKeys,
  allMoveKeys,
  allRegionKeys,
  allTransformativeReactionKeys,
} from '@genshin-optimizer/consts'
import type {
  AnyNode,
  NumNode,
  StrNode,
  TagOverride,
  TagValRead,
} from '@genshin-optimizer/pando'
import {
  TypedRead,
  tag as baseTag,
  tagVal as baseTagVal,
  constant,
  reread,
} from '@genshin-optimizer/pando'
import type { Source, TagMapNodeEntry } from '.'
import { entryTypes, members, presets, srcs } from './listing'

export const fixedTags = {
  preset: presets,
  member: members,
  dst: members,
  et: entryTypes,
  src: srcs,

  region: allRegionKeys,
  ele: allElementWithPhyKeys,
  move: allMoveKeys,
  trans: allTransformativeReactionKeys,
  amp: [...allAmplifyingReactionKeys, ''],
  cata: [...allCatalyzeReactionKeys, ''],
} as const
export type Tag = {
  [key in keyof typeof fixedTags]?: (typeof fixedTags)[key][number] | null
} & { name?: string | null; qt?: string | null; q?: string | null }

export class Read extends TypedRead<Tag, Read> {
  override register<C extends keyof Tag>(cat: C, val: Tag[C]): void {
    if (val == null) return // null | undefined
    if (cat === 'name') usedNames.add(val)
    else if (cat === 'q') usedQ.add(val)
  }
  override ctor(tag: Tag, ex: Read['ex']): Read {
    return new Read(tag, ex)
  }

  name(name: string): Read {
    return super.with('name', name)
  }
  src(src: Source): Read {
    return super.with('src', src)
  }

  add(value: number | string | AnyNode): TagMapNodeEntry {
    return super.toEntry(typeof value === 'object' ? value : constant(value))
  }
  reread(r: Read): TagMapNodeEntry {
    return super.toEntry(reread(r.tag))
  }

  override toString(): string {
    return tagStr(this.tag, this.ex)
  }

  // Optional Modifiers

  // Move
  get normal(): Read {
    return super.with('move', 'normal')
  }
  get charged(): Read {
    return super.with('move', 'charged')
  }
  get plunging(): Read {
    return super.with('move', 'plunging')
  }
  get skill(): Read {
    return super.with('move', 'skill')
  }
  get burst(): Read {
    return super.with('move', 'burst')
  }
  get elemental(): Read {
    return super.with('move', 'elemental')
  }

  // Element
  get anemo(): Read {
    return super.with('ele', 'anemo')
  }
  get pyro(): Read {
    return super.with('ele', 'pyro')
  }
  get hydro(): Read {
    return super.with('ele', 'hydro')
  }
  get geo(): Read {
    return super.with('ele', 'geo')
  }
  get cryo(): Read {
    return super.with('ele', 'cryo')
  }
  get electro(): Read {
    return super.with('ele', 'electro')
  }
  get dendro(): Read {
    return super.with('ele', 'dendro')
  }
  get physical(): Read {
    return super.with('ele', 'physical')
  }

  // Reaction
  get overloaded(): Read {
    return super.with('trans', 'overloaded')
  }
  get shattered(): Read {
    return super.with('trans', 'shattered')
  }
  get electrocharged(): Read {
    return super.with('trans', 'electrocharged')
  }
  get superconduct(): Read {
    return super.with('trans', 'superconduct')
  }
  get swirl(): Read {
    return super.with('trans', 'swirl')
  }
  get burning(): Read {
    return super.with('trans', 'burning')
  }
  get bloom(): Read {
    return super.with('trans', 'bloom')
  }
  get burgeon(): Read {
    return super.with('trans', 'burgeon')
  }
  get hyperbloom(): Read {
    return super.with('trans', 'hyperbloom')
  }
  get vaporize(): Read {
    return super.with('amp', 'vaporize')
  }
  get melt(): Read {
    return super.with('amp', 'melt')
  }
  get spread(): Read {
    return super.with('cata', 'spread')
  }
  get aggravate(): Read {
    return super.with('cata', 'aggravate')
  }

  // Region
  get mondstadt(): Read {
    return super.with('region', 'mondstadt')
  }
  get liyue(): Read {
    return super.with('region', 'liyue')
  }
  get inazuma(): Read {
    return super.with('region', 'inazuma')
  }
  get sumeru(): Read {
    return super.with('region', 'sumeru')
  }
  get fontaine(): Read {
    return super.with('region', 'fontaine')
  }
  get natlan(): Read {
    return super.with('region', 'natlan')
  }
  get snezhnaya(): Read {
    return super.with('region', 'snezhnaya')
  }
  get khaenriah(): Read {
    return super.with('region', 'khaenriah')
  }
}
export function tagStr(tag: Tag, ex?: any): string {
  const {
    name,
    preset,
    member,
    dst,
    et,
    src,
    region,
    ele,
    q,
    qt,
    move,
    trans,
    amp,
    cata,
    ...remaining
  } = tag

  if (Object.keys(remaining).length) console.error(remaining)

  let result = '{ ',
    includedRequired = false,
    includedBar = false
  function required(str: string | undefined | null) {
    if (!str) return
    result += str + ' '
    includedRequired = true
  }
  function optional(str: string | undefined | null) {
    if (!str) return
    if (includedRequired && !includedBar) {
      includedBar = true
      result += '| '
    }
    result += str + ' '
  }
  required(name && `#${name}`)
  required(preset)
  required(member)
  required(dst && `(${dst})`)
  required(src)
  required(et)
  if (qt && q) required(`${qt}.${q}`)
  else if (qt) required(`${qt}.`)
  else if (q) required(`.${q}`)

  optional(region)
  optional(move)
  optional(ele)
  optional(trans)
  optional(amp)
  optional(cata)
  required(ex && `[${ex}]`)
  return result + '}'
}
export function tag(v: number | NumNode, tag: Tag): TagOverride<NumNode>
export function tag(v: string | StrNode, tag: Tag): TagOverride<StrNode>
export function tag(
  v: number | string | AnyNode,
  tag: Tag
): TagOverride<AnyNode>
export function tag(
  v: number | string | AnyNode,
  tag: Tag
): TagOverride<AnyNode> {
  return typeof v == 'object' && v.op == 'tag'
    ? baseTag(v.x[0], { ...v.tag, ...tag }) // Fold nested tag nodes
    : baseTag(v, tag)
}
export function tagVal(cat: keyof Tag): TagValRead {
  return baseTagVal(cat)
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
export const usedQ = new Set('_')
