import type { Tag as BaseTag } from '@genshin-optimizer/gameOpt/engine'
import {
  Read as BaseRead,
  reader as baseReader,
  entryTypes,
  presets,
  setReader,
} from '@genshin-optimizer/gameOpt/engine'
import type { AnyNode } from '@genshin-optimizer/pando/engine'
import type { DamageType, Dst, Src, TagMapNodeEntry } from '.'
import {
  damageTypes,
  elementalTypes,
  members,
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
export type Tag = BaseTag<Src, Dst, Sheet>

export class Read extends BaseRead<Tag, Src, Dst, Sheet> {
  addWithDmgType(
    dmgType: DamageType,
    val: number | string | AnyNode
  ): TagMapNodeEntry[] {
    return this[dmgType].map((r) => r.add(val))
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

// Need to instantiate with sr-specific reader
setReader<Tag, Src, Dst, Sheet>(new Read({}, undefined))
export const reader = baseReader as Read

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
