import type {
  AnyNode,
  NumNode,
  ReRead,
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
import { allElementalTypeKeys } from '@genshin-optimizer/sr-consts'
import { entryTypes, members, moves, srcs, type Source } from './listing'

export const fixedTags = {
  member: members,
  dst: members,
  et: entryTypes,
  src: srcs,

  elementalType: allElementalTypeKeys,
  move: moves,
}
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

  add(value: number | string | AnyNode): { tag: Tag; value: AnyNode } {
    return {
      tag: this.tag,
      value: typeof value === 'object' ? value : constant(value),
    }
  }
  reread(r: Read): { tag: Tag; value: ReRead } {
    return { tag: this.tag, value: reread(r.tag) }
  }

  // Optional Modifiers

  // Elemental Type
  get physical() {
    return super.with('elementalType', 'Physical')
  }
  get quantum(): Read {
    return super.with('elementalType', 'Quantum')
  }
  get lightning(): Read {
    return super.with('elementalType', 'Lightning')
  }
  get ice(): Read {
    return super.with('elementalType', 'Ice')
  }
  get wind(): Read {
    return super.with('elementalType', 'Wind')
  }
  get fire(): Read {
    return super.with('elementalType', 'Fire')
  }
  get imaginary(): Read {
    return super.with('elementalType', 'Imaginary')
  }

  // Move
  get basicDmg(): Read {
    return super.with('move', 'basic')
  }
  get skillDmg(): Read {
    return super.with('move', 'skill')
  }
  get ultDmg(): Read {
    return super.with('move', 'ult')
  }
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
  return baseTag(v, tag)
}
export function tagVal(cat: keyof Tag): TagValRead {
  return baseTagVal(cat)
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
export const usedQ = new Set('_')
