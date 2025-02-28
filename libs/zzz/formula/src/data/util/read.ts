import {
  Read as BaseRead,
  reader as baseReader,
  entryTypes,
  presets,
  setReader,
  type Tag as BaseTag,
} from '@genshin-optimizer/game-opt/engine'
import type { AnyNode } from '@genshin-optimizer/pando/engine'
import type {
  Attribute,
  DamageType,
  Dst,
  Faction,
  SkillType,
  Specialty,
  Src,
  TagMapNodeEntry,
} from '.'
import {
  attributes,
  damageTypes,
  factions,
  members,
  sheets,
  skillTypes,
  specialties,
  type Sheet,
} from './listing'

export const fixedTags = {
  preset: presets,
  src: members,
  dst: members,
  et: entryTypes,
  sheet: sheets,

  attribute: attributes,
  skillType: skillTypes,
  damageType1: damageTypes,
  damageType2: damageTypes,

  // For `count`
  specialty: specialties,
  faction: factions,
}
export type Tag = BaseTag<Sheet, Src, Dst> & {
  attribute?: Attribute
  skillType?: SkillType
  damageType1?: DamageType
  damageType2?: DamageType

  specialty?: Specialty
  faction?: Faction
}

export class Read extends BaseRead<Tag> {
  override add(
    value: number | string | AnyNode,
    force = false
  ): TagMapNodeEntry {
    if (
      !force &&
      this.tag.q === 'dmg_' &&
      !this.tag.attribute &&
      !this.tag.skillType &&
      !this.tag.damageType1 &&
      !this.tag.damageType2
    ) {
      throw new Error(
        'Tried to add to `dmg_` without optional modifier, use `common_dmg_` instead'
      )
    }
    return super.add(value)
  }

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

  // Skill type
  get basicSkill(): Read {
    return super.with('skillType', 'basicSkill')
  }
  get dodgeSkill(): Read {
    return super.with('skillType', 'dodgeSkill')
  }
  get specialSkill(): Read {
    return super.with('skillType', 'specialSkill')
  }
  get chainSkill(): Read {
    return super.with('skillType', 'chainSkill')
  }
  get assistSkill(): Read {
    return super.with('skillType', 'assistSkill')
  }

  // Damage type
  get basic(): Read[] {
    return [
      super.with('damageType1', 'basic'),
      super.with('damageType2', 'basic'),
    ]
  }
  get dash(): Read[] {
    return [
      super.with('damageType1', 'dash'),
      super.with('damageType2', 'dash'),
    ]
  }
  get dodgeCounter(): Read[] {
    return [
      super.with('damageType1', 'dodgeCounter'),
      super.with('damageType2', 'dodgeCounter'),
    ]
  }
  get special(): Read[] {
    return [
      super.with('damageType1', 'special'),
      super.with('damageType2', 'special'),
    ]
  }
  get exSpecial(): Read[] {
    return [
      super.with('damageType1', 'exSpecial'),
      super.with('damageType2', 'exSpecial'),
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
  get quickAssist(): Read[] {
    return [
      super.with('damageType1', 'quickAssist'),
      super.with('damageType2', 'quickAssist'),
    ]
  }
  get defensiveAssist(): Read[] {
    return [
      super.with('damageType1', 'defensiveAssist'),
      super.with('damageType2', 'defensiveAssist'),
    ]
  }
  get evasiveAssist(): Read[] {
    return [
      super.with('damageType1', 'evasiveAssist'),
      super.with('damageType2', 'evasiveAssist'),
    ]
  }
  get assistFollowUp(): Read[] {
    return [
      super.with('damageType1', 'assistFollowUp'),
      super.with('damageType2', 'assistFollowUp'),
    ]
  }
  get anomaly(): Read[] {
    return [
      super.with('damageType1', 'anomaly'),
      super.with('damageType2', 'anomaly'),
    ]
  }
  get disorder(): Read[] {
    return [
      super.with('damageType1', 'disorder'),
      super.with('damageType2', 'disorder'),
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

  // For `count` usage, use lighter footprint so it doesn't pollute autocomplete
  // Specialty
  withSpecialty(specialty: Specialty): Read {
    return super.with('specialty', specialty)
  }

  // Faction
  withFaction(faction: Faction): Read {
    return super.with('faction', faction)
  }
}

// Need to instantiate with zzz-specific reader
setReader<Tag>(new Read({}, undefined))
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
  required(src && `[${src}]`, 'src')
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
