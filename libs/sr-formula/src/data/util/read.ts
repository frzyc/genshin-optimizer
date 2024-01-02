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
import { entryTypes, members, moves, srcs, type Source } from './listing'

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

export function tagStr(tag: Tag, ex?: any): string {
  const { name, member, dst, et, src, q, qt, ...remaining } = tag

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
  required(member)
  required(dst && `(${dst})`)
  required(src)
  required(et)
  if (qt && q) required(`${qt}.${q}`)
  else if (qt) required(`${qt}.`)
  else if (q) required(`.${q}`)

  required(ex && `[${ex}]`)
  return result + '}'
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
export const usedQ = new Set('_')
