import {
  notEmpty,
  removeUndefinedFields,
  shallowCompareObj,
  validateValue,
} from '@genshin-optimizer/common/util'
import { correctConditionalValue } from '@genshin-optimizer/game-opt/engine'
import {
  type AttributeKey,
  type CharacterKey,
  allAttributeKeys,
} from '@genshin-optimizer/zzz/consts'
import type {
  DamageType,
  Dst,
  Sheet,
  Src,
  Tag,
} from '@genshin-optimizer/zzz/formula'
import {
  formulas,
  getConditional,
  isMember,
} from '@genshin-optimizer/zzz/formula'
import type { ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'

// Corresponds to the `own.common.critMode` libs\zzz\formula\src\data\common\dmg.ts
export type critModeKey = 'avg' | 'crit' | 'nonCrit'
export const critModeKeys: critModeKey[] = ['avg', 'crit', 'nonCrit'] as const

// Target
export type SpecificDmgTypeKey = Exclude<
  DamageType,
  'anomaly' | 'disorder' | 'aftershock' | 'elemental'
>
// Corresponds to damageTypes in libs\zzz\formula\src\data\util\listing.ts
export const specificDmgTypeKeys: SpecificDmgTypeKey[] = [
  'basic',
  'dash',
  'dodgeCounter',
  'special',
  'exSpecial',
  'chain',
  'ult',
  'quickAssist',
  'defensiveAssist',
  'evasiveAssist',
  'assistFollowUp',
] as const

function isSpeicifcDmgTypeKey(key: string): key is SpecificDmgTypeKey {
  return specificDmgTypeKeys.includes(key as SpecificDmgTypeKey)
}
export const targetQ = [
  'hp',
  'atk',
  'def',
  'impact',
  'crit_',
  'crit_dmg_',
  'pen',
  'enerRegen',
  'anomProf',
  'anomMas',
] as const
export const targetQt = ['initial', 'final'] as const

export type TargetTag = {
  sheet?: string
  name?: string
  damageType1?: SpecificDmgTypeKey
  damageType2?: 'aftershock'
  q?: (typeof targetQ)[number]
  qt?: (typeof targetQt)[number]
}

// Bonus Stats
export const bonusStatQtKeys = ['combat', 'base', 'initial'] as const
export const bonusStatKeys = [
  'hp',
  'hp_',
  'def',
  'def_',
  'atk',
  'atk_',
  'dmg_',
  'enerRegen_',
  'crit_',
  'crit_dmg_',
  'anomProf',
  'impact_',
  'anomMas_',
  'anomMas',
] as const
export type BonusStatKey = (typeof bonusStatKeys)[number]

export const bonusStatDmgTypeIncStats = [
  'atk_',
  'dmg_',
  'crit_',
  'crit_dmg_',
] as const

// Could add 'elemental' back if there is all elemental dmg bonus in the future
export type BonusStatDamageType = Exclude<
  DamageType,
  'elemental' | 'aftershock'
>
export const bonusStatDamageTypes: BonusStatDamageType[] = [
  'basic',
  'dash',
  'dodgeCounter',
  'special',
  'exSpecial',
  'chain',
  'ult',
  'quickAssist',
  'defensiveAssist',
  'evasiveAssist',
  'assistFollowUp',
  'anomaly',
  'disorder',
] as const

export type BonusStatTag = {
  q: BonusStatKey
  qt: (typeof bonusStatQtKeys)[number]
  attribute?: AttributeKey
  damageType1?: BonusStatDamageType
  damageType2?: 'aftershock'
}

export type CharOpt = {
  target?: TargetTag

  conditionals: Array<{
    sheet: Sheet
    src: Src
    dst: Dst
    condKey: string
    condValue: number
  }>
  bonusStats: Array<{
    tag: BonusStatTag
    value: number
  }>
  critMode: critModeKey

  // Enemy stuff
  enemyLvl: number
  enemyDef: number
  enemyisStunned: boolean

  // link to optConfig
  optConfigId?: string
}
export class CharacterOptManager extends DataManager<
  CharacterKey,
  'charOpts',
  CharOpt,
  CharOpt
> {
  constructor(database: ZzzDatabase) {
    super(database, 'charOpts')
  }
  override validate(obj: unknown): CharOpt | undefined {
    if (!obj || typeof obj !== 'object') return undefined
    let {
      target,
      conditionals,
      bonusStats,
      critMode,

      enemyLvl,
      enemyDef,
      enemyisStunned,

      optConfigId,
    } = obj as CharOpt
    if (!Array.isArray(conditionals)) conditionals = []
    // Validate target for formula
    if (target?.name) {
      const formula = getFormula(target)
      if (formula) {
        let { damageType1, damageType2 } = target
        if (formula.name !== 'standardDmgInst') {
          damageType1 = undefined
          damageType2 = undefined
        }
        if (damageType1 && !isSpeicifcDmgTypeKey(damageType1))
          damageType1 = undefined
        if (damageType2 && damageType2 !== 'aftershock') damageType2 = undefined
        target = removeUndefinedFields({
          sheet: formula.sheet,
          name: formula.name,
          damageType1,
          damageType2,
        }) as TargetTag
      } else {
        target = undefined
      }
    } else if (target) {
      // target is a stat
      const { q, qt } = target
      if (
        !q ||
        !qt ||
        !targetQ.includes(q as (typeof targetQ)[number]) ||
        !targetQt.includes(qt as (typeof targetQt)[number])
      )
        target = undefined
      else
        target = {
          q,
          qt,
        }
    }

    const hashList: string[] = [] // a hash to ensure sheet:condKey:src:dst is unique
    conditionals = conditionals
      .map(({ sheet, condKey, src, dst, condValue }) => {
        if (!condValue) return undefined //remove conditionals when the value is 0
        if (!isMember(src) || !(dst === null || isMember(dst))) return undefined
        const cond = getConditional(sheet, condKey)
        if (!cond) return undefined

        // validate uniqueness
        const hash = `${sheet}:${condKey}:${src}:${dst}`
        if (hashList.includes(hash)) return undefined
        hashList.push(hash)

        // validate values
        condValue = correctConditionalValue(cond, condValue)

        return {
          sheet,
          src,
          dst,
          condKey,
          condValue,
        }
      })
      .filter(notEmpty)
    if (!Array.isArray(bonusStats)) bonusStats = []
    bonusStats = bonusStats.map(
      ({ tag: { q, qt, attribute, damageType1, damageType2 }, value }) => {
        if (typeof value !== 'number') value = 0
        q = validateValue(q, bonusStatKeys) ?? 'atk'
        qt = validateValue(qt, bonusStatQtKeys) ?? 'combat'

        if (q !== 'dmg_') attribute = undefined
        if (attribute) attribute = validateValue(attribute, allAttributeKeys)

        if (
          !bonusStatDmgTypeIncStats.includes(
            q as (typeof bonusStatDmgTypeIncStats)[number]
          )
        )
          damageType1 = undefined
        if (damageType1)
          damageType1 = validateValue(damageType1, bonusStatDamageTypes)

        if (q !== 'dmg_' && q !== 'crit_dmg_') damageType2 = undefined
        if (damageType2 && damageType2 !== 'aftershock') damageType2 = undefined

        return {
          tag: removeUndefinedFields({
            q,
            qt,
            attribute,
            damageType1,
            damageType2,
          }) as BonusStatTag,
          value,
        }
      }
    )

    if (!critModeKeys.includes(critMode)) critMode = 'avg'

    if (typeof enemyLvl !== 'number') enemyLvl = 80
    if (typeof enemyDef !== 'number') enemyDef = 953
    enemyisStunned = !!enemyisStunned

    if (optConfigId && !this.database.optConfigs.keys.includes(optConfigId))
      optConfigId = undefined

    const charOpt: CharOpt = {
      target,
      conditionals,
      bonusStats,
      critMode,

      enemyLvl,
      enemyDef,
      enemyisStunned,

      optConfigId,
    }
    return charOpt
  }

  // These overrides allow CharacterKey to be used as id.
  // This assumes we only support one copy of a character opt in a DB.
  override toStorageKey(key: string): string {
    return `${this.goKeySingle}_${key}`
  }
  override toCacheKey(key: string): CharacterKey {
    return key.split(`${this.goKeySingle}_`)[1] as CharacterKey
  }
  getOrCreate(key: CharacterKey): CharOpt {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharOpt())
    }
    return this.get(key) as CharOpt
  }
  setConditional(
    charKey: CharacterKey,
    sheet: Sheet,
    condKey: string,
    src: Src,
    dst: Dst,
    condValue: number
  ) {
    this.set(charKey, (charOpt) => {
      const conditionals = [...charOpt.conditionals]
      const condIndex = conditionals.findIndex(
        (c) =>
          c.condKey === condKey &&
          c.sheet === sheet &&
          c.src === src &&
          c.dst === dst
      )
      if (condIndex === -1) {
        conditionals.push({
          sheet,
          src,
          dst,
          condKey,
          condValue,
        })
      } else {
        const cond = conditionals[condIndex]
        // Check if the value is the same, return false to not propagate the update.
        if (
          cond.sheet === sheet &&
          cond.src === src &&
          cond.dst === dst &&
          cond.condKey === condKey &&
          cond.condValue === condValue
        )
          return false
        cond.sheet = sheet
        cond.src = src
        cond.dst = dst
        cond.condKey = condKey
        cond.condValue = condValue
      }
      return { conditionals }
    })
  }
  setBonusStat(
    charKey: CharacterKey,
    tag: BonusStatTag,
    value: number | null, // use null to remove the stat
    index?: number // to edit an existing stat
  ) {
    this.set(charKey, (charOpt) => {
      const statIndex =
        index ??
        charOpt.bonusStats.findIndex((s) => shallowCompareObj(s.tag, tag))
      const bonusStats = [...charOpt.bonusStats]
      if (statIndex === -1 && value !== null) {
        bonusStats.push({ tag, value })
      } else if (value === null && statIndex > -1) {
        bonusStats.splice(statIndex, 1)
      } else if (value !== null && statIndex > -1) {
        bonusStats[statIndex].value = value
        bonusStats[statIndex].tag = tag
      }
      return { bonusStats }
    })
  }
}

export function initialCharOpt(): CharOpt {
  return {
    conditionals: [],
    bonusStats: [],
    critMode: 'avg',

    enemyLvl: 80,
    enemyDef: 953,
    enemyisStunned: false,
  }
}

export function applyDamageTypeToTag(
  tag: Tag,
  damageType1: DamageType | undefined | null,
  damageType2: DamageType | undefined | null
): Tag {
  return {
    ...tag,
    ...(damageType1 ? { damageType1 } : {}),
    ...(damageType2 ? { damageType2 } : {}),
  }
}

function getFormula({ sheet, name }: TargetTag) {
  if (!sheet || !name) return
  return (formulas as any)[sheet]?.[name] as
    | {
        sheet: Sheet
        name: string
        tag: Tag
      }
    | undefined
}

export function targetTag(target: Exclude<CharOpt['target'], undefined>): Tag {
  const { damageType1, damageType2 } = target
  const formula = getFormula(target)
  if (formula)
    return applyDamageTypeToTag(formula.tag, damageType1, damageType2)
  // stat target
  return {
    et: 'own',
    q: target.q ?? 'atk',
    qt: target.qt ?? 'final',
    sheet: 'agg',
  }
}

export function newBonusStatTag(q: BonusStatKey): BonusStatTag {
  return {
    q,
    qt: 'combat',
  }
}
