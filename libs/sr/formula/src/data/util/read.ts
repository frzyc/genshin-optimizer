import type {
  AnyNode,
  NumNode,
  StrNode,
  TagOverride,
  TagValRead,
} from '@genshin-optimizer/pando/engine'
import {
  TypedRead,
  tag as baseTag,
  tagVal as baseTagVal,
  constant,
  reread,
} from '@genshin-optimizer/pando/engine'
import type { DamageType, TagMapNodeEntries, TagMapNodeEntry } from '.'
import {
  damageTypes,
  elementalTypes,
  entryTypes,
  members,
  presets,
  sheets,
  type Sheet,
} from './listing'

export const fixedTags = {
  preset: presets,
  src: members,
  dst: members,
  et: entryTypes,
  sheet: sheets,

  elementalType: elementalTypes,
  damageType1: damageTypes,
  damageType2: damageTypes,
}
export type Tag = {
  [key in keyof typeof fixedTags]?: (typeof fixedTags)[key][number] | null
} & { name?: string | null; qt?: string | null; q?: string | null }

export class Read extends TypedRead<Tag> {
  override register<C extends keyof Tag>(cat: C, val: Tag[C]): void {
    if (val == null) return // null | undefined
    if (cat === 'name') usedNames.add(val)
    else if (cat === 'q') usedQ.add(val)
  }

  name(name: string): Read {
    return super.with('name', name)
  }
  sheet(sheet: Sheet): Read {
    return super.with('sheet', sheet)
  }

  add(value: number | string | AnyNode): TagMapNodeEntry {
    return super.toEntry(typeof value === 'object' ? value : constant(value))
  }
  addOnce(sheet: Sheet, value: number | NumNode): TagMapNodeEntries {
    if (this.tag.et !== 'teamBuff' || !sheet)
      throw new Error('Unsupported non-stacking entry')
    const q = `${uniqueId(sheet)}`
    // Use raw tags here instead of `own.*` to avoid cyclic dependency
    // Entries in TeamData need `member:` for priority
    return [
      // 1) ownBuff.stackIn.<q>.add(value)
      this.withTag({ et: 'own', sheet, qt: 'stackIn', q }).add(value),
      // 2) In TeamData: ownBuff.stackTmp.<q>.add(cmpNE(own.stackIn.<q>, 0, /* priority */))
      // 3) In TeamData: ownBuff.stackOut.<q>.add(cmpEq(team.stackTmp.<q>.max, /* priority */, own.stackIn))
      // 4) teamBuff.<stat>.add(own.stackOut.<q>)
      this.add(reader.withTag({ et: 'own', sheet, qt: 'stackOut', q })),
    ]
  }
  addWithDmgType(
    dmgType: DamageType,
    val: number | string | AnyNode
  ): TagMapNodeEntry[] {
    return this[dmgType].map((r) => r.add(val))
  }
  reread(r: Read): TagMapNodeEntry {
    return super.toEntry(reread(r.tag))
  }

  override toString(): string {
    return tagStr(this.tag, this.ex)
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
  return typeof v == 'object' && v.op == 'tag'
    ? baseTag(v.x[0], { ...v.tag, ...tag }) // Fold nested tag nodes
    : baseTag(v, tag)
}
export function tagVal(cat: keyof Tag): TagValRead {
  return baseTagVal(cat)
}

export function tagStr(tag: Tag, ex?: any): string {
  const {
    name,
    preset,
    src,
    dst,
    et,
    sheet,
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
  function required(str: string | undefined | null, name: string) {
    if (!str && str !== null) return
    result += str === null ? `!${name} ` : str + ' '
    includedRequired = true
  }
  function optional(str: string | undefined | null, name: string) {
    if (!str && str !== null) return
    if (includedRequired && !includedBar) {
      includedBar = true
      result += '| '
    }
    result += str === null ? `!${name} ` : str + ' '
  }
  required(name && `#${name}`, 'name')
  required(preset, 'preset')
  required(src, 'src')
  required(dst && `(${dst})`, 'dst')
  required(sheet, 'sheet')
  required(et, 'et')
  if (qt && q) required(`${qt}.${q}`, '')
  else if (qt) required(`${qt}.`, '')
  else if (q) required(`.${q}`, '')

  optional(elementalType, 'ele')
  optional(damageType1 && `1:${damageType1}`, 'dmg1')
  optional(damageType2 && `2:${damageType2}`, 'dmg2')
  if (ex) result += `[${ex}] `
  return result + '}'
}

const counters: Record<string, number> = {}
function uniqueId(namespace: string): number {
  if (!counters[namespace]) counters[namespace] = 0
  const result = counters[namespace]!
  counters[namespace] += 1
  return result
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
export const usedQ = new Set('_')
