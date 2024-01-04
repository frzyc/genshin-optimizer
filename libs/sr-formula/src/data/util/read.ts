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
import type { TagMapNodeEntry } from '.'
import {
  damageTypes,
  elementalTypes,
  entryTypes,
  members,
  presets,
  srcs,
  type Source,
} from './listing'

export const fixedTags = {
  preset: presets,
  member: members,
  dst: members,
  et: entryTypes,
  src: srcs,

  elementalType: elementalTypes,
  damageType: damageTypes,
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

  add(value: number | string | AnyNode): TagMapNodeEntry {
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
    return super.with('elementalType', 'physical')
  }
  get quantum(): Read {
    return super.with('elementalType', 'quantum')
  }
  get lightning(): Read {
    return super.with('elementalType', 'lightning')
  }
  get ice(): Read {
    return super.with('elementalType', 'ice')
  }
  get wind(): Read {
    return super.with('elementalType', 'wind')
  }
  get fire(): Read {
    return super.with('elementalType', 'fire')
  }
  get imaginary(): Read {
    return super.with('elementalType', 'imaginary')
  }

  // Damage type
  get basicDmg(): Read {
    return super.with('damageType', 'basic')
  }
  get skillDmg(): Read {
    return super.with('damageType', 'skill')
  }
  get ultDmg(): Read {
    return super.with('damageType', 'ult')
  }
  get techniqueDmg(): Read {
    return super.with('damageType', 'technique')
  }
  get followUpDmg(): Read {
    return super.with('damageType', 'followUp')
  }
  get breakDmg(): Read {
    return super.with('damageType', 'break')
  }
  get elementalDmg(): Read {
    return super.with('damageType', 'elemental')
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
  const {
    name,
    preset,
    member,
    dst,
    et,
    src,
    q,
    qt,
    elementalType,
    damageType: attackType,
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

  optional(elementalType)
  optional(attackType)
  required(ex && `[${ex}]`)
  return result + '}'
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
export const usedQ = new Set('_')
