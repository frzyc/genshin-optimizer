import {
  Read as BaseRead,
  reader as baseReader,
  entryTypes,
  presets,
  setReader,
  type Tag as BaseTag,
} from '@genshin-optimizer/game-opt/engine'
import type { AnyNode } from '@genshin-optimizer/pando/engine'
import type { DamageType, Dst, Src, TagMapNodeEntry } from '.'
import { attributes, damageTypes, members, sheets, type Sheet } from './listing'

export const fixedTags = {
  preset: presets,
  src: members,
  dst: members,
  et: entryTypes,
  sheet: sheets,

  attribute: attributes,
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

  // Attribute
  get fire() {
    return super.with('attribute', 'fire')
  }
  get electric(): Read {
    return super.with('attribute', 'electric')
  }
  get ice(): Read {
    return super.with('attribute', 'ice')
  }
  get physical(): Read {
    return super.with('attribute', 'physical')
  }
  get ether(): Read {
    return super.with('attribute', 'ether')
  }

  // Damage type
  get basic(): Read[] {
    return [
      super.with('damageType1', 'basic'),
      super.with('damageType2', 'basic'),
    ]
  }
  get dodge(): Read[] {
    return [
      super.with('damageType1', 'dodge'),
      super.with('damageType2', 'dodge'),
    ]
  }
  get special(): Read[] {
    return [
      super.with('damageType1', 'special'),
      super.with('damageType2', 'special'),
    ]
  }
  get chain(): Read[] {
    return [
      super.with('damageType1', 'chain'),
      super.with('damageType2', 'chain'),
    ]
  }
  get ult(): Read[] {
    return [super.with('damageType1', 'ult'), super.with('damageType2', 'ult')]
  }
  get assist(): Read[] {
    return [
      super.with('damageType1', 'assist'),
      super.with('damageType2', 'assist'),
    ]
  }
  get anomaly(): Read[] {
    return [
      super.with('damageType1', 'anomaly'),
      super.with('damageType2', 'anomaly'),
    ]
  }
  get additional(): Read[] {
    return [
      super.with('damageType1', 'additional'),
      super.with('damageType2', 'additional'),
    ]
  }
  get elemental(): Read[] {
    return [
      super.with('damageType1', 'elemental'),
      super.with('damageType2', 'elemental'),
    ]
  }
}

// Need to instantiate with zzz-specific reader
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
    attribute,
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

  optional(attribute, 'attr')
  optional(damageType1 && `1:${damageType1}`, 'dmg1')
  optional(damageType2 && `2:${damageType2}`, 'dmg2')
  if (ex) result += `[${ex}] `
  return result + '}'
}
