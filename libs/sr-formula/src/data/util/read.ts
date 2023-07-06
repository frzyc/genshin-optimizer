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
import { damageType } from '@genshin-optimizer/sr-consts'
import { type Source, entryTypes, members, moves, srcs } from './listing'

export const fixedTags = {
  member: members,
  dst: members,
  et: entryTypes,
  src: srcs,

  dt: damageType,
  move: moves,
}
export type Tag = {
  [key in keyof typeof fixedTags]?: (typeof fixedTags)[key][number] | null
} & { name?: string | null; qt?: string | null; q?: string | null }

const tracker = {
  name: new Set<string>(),
  q: new Set('_'),
}
export class Read extends TypedRead<Tag, Read> {
  constructor(tag: Tag, accu: Read['accu']) {
    super((t, a) => new Read(t, a), tag, accu, tracker)
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

  // Damage Type
  get physical() {
    return super.with('dt', 'Physical')
  }
  get quantum(): Read {
    return super.with('dt', 'Quantum')
  }
  get thunder(): Read {
    return super.with('dt', 'Thunder')
  }
  get ice(): Read {
    return super.with('dt', 'Ice')
  }
  get wind(): Read {
    return super.with('dt', 'Wind')
  }
  get fire(): Read {
    return super.with('dt', 'Fire')
  }
  get imaginary(): Read {
    return super.with('dt', 'Imaginary')
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
