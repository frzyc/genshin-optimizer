import type {
  AnyNode,
  NumNode,
  ReRead,
  StrNode,
  TagOverride,
  TagValRead,
} from '@genshin-optimizer/pando_engine'
import {
  TypedRead,
  tag as baseTag,
  tagVal as baseTagVal,
  constant,
  reread,
} from '@genshin-optimizer/pando_engine'
import type { DamageType, TagMapNodeEntry } from '.'
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
  damageType1: damageTypes,
  damageType2: damageTypes,
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
  addWithDmgType(
    dmgType: DamageType,
    val: number | string | AnyNode
  ): TagMapNodeEntry[] {
    return this[dmgType].map((r) => r.add(val))
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
  get basic(): Read[] {
    return [
      super.with('damageType1', 'basic'),
      super.with('damageType2', 'basic'),
    ]
  }
  get skill(): Read[] {
    return [
      super.with('damageType1', 'skill'),
      super.with('damageType2', 'skill'),
    ]
  }
  get ult(): Read[] {
    return [super.with('damageType1', 'ult'), super.with('damageType2', 'ult')]
  }
  get technique(): Read[] {
    return [
      super.with('damageType1', 'technique'),
      super.with('damageType2', 'technique'),
    ]
  }
  get followUp(): Read[] {
    return [
      super.with('damageType1', 'followUp'),
      super.with('damageType2', 'followUp'),
    ]
  }
  get dot(): Read[] {
    return [super.with('damageType1', 'dot'), super.with('damageType2', 'dot')]
  }
  get break(): Read[] {
    return [
      super.with('damageType1', 'break'),
      super.with('damageType2', 'break'),
    ]
  }
  get elemental(): Read[] {
    return [
      super.with('damageType1', 'elemental'),
      super.with('damageType2', 'elemental'),
    ]
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
    damageType1,
    damageType2,
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
  optional(`1:${damageType1}`)
  optional(`2:${damageType2}`)
  required(ex && `[${ex}]`)
  return result + '}'
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
export const usedQ = new Set('_')
