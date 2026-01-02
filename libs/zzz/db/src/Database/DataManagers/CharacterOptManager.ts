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
  allCharacterKeys,
} from '@genshin-optimizer/zzz/consts'
import type {
  DamageType,
  Dst,
  Sheet,
  Src,
  Tag,
  enemy,
  own,
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
export const bonusStatKeys: Array<keyof typeof own.final> = [
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
  'impact',
  'impact_',
  'dazeInc_',
  'anomMas_',
  'anomMas',
  'pen_',
  'pen',
  'defIgn_',
  'resIgn_',
  'sheerForce',
  'sheer_dmg_',
] as const
export type BonusStatKey = (typeof bonusStatKeys)[number]

export const bonusStatDmgTypeIncStats = [
  'atk_',
  'dmg_',
  'crit_',
  'crit_dmg_',
] as const

export const enemyStatKeys: Array<keyof typeof enemy.common> = [
  'defRed_',
  'res_',
  'resRed_',
  'stun_',
  'unstun_',
  'anomBuildupRes_',
  'dazeRes_',
  'dazeInc_',
  'dazeRed_',
] as const

export type EnemyStatKey = (typeof enemyStatKeys)[number]

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
  'entrySkill',
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

export type EnemyStatsTag = {
  q: EnemyStatKey
  attribute?: AttributeKey
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
    disabled: boolean
  }>
  teammates: Array<CharacterKey>
  critMode: critModeKey

  // Enemy stuff
  enemyLvl: number
  enemyDef: number
  enemyStunMultiplier: number
  enemyStats: Array<{
    tag: EnemyStatsTag
    value: number
  }>

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
      teammates,
      critMode,

      enemyLvl,
      enemyDef,
      enemyStunMultiplier,
      enemyStats,

      optConfigId,
    } = obj as CharOpt
    if (!Array.isArray(conditionals)) conditionals = []
    // Validate target for formula
    if (target?.name) {
      const formula = getFormula(target)
      if (formula) {
        let { damageType1, damageType2 } = target
        if (
          formula.name !== 'standardDmgInst' &&
          formula.name !== 'sheerDmgInst'
        ) {
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
    bonusStats = bonusStats
      .map(
        ({
          tag: { q, qt, attribute, damageType1, damageType2 },
          value,
          disabled,
        }) => {
          if (typeof value !== 'number') value = 0
          const q_ = validateValue(q, bonusStatKeys)
          const qt_ = validateValue(qt, bonusStatQtKeys)
          if (!q_ || !qt_) return undefined
          q = q_
          qt = qt_

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

          // damageType2 is only 'aftershock', and in-game there is only buffs that increase its dmg_ and crit_dmg_
          if (q !== 'dmg_' && q !== 'crit_dmg_') damageType2 = undefined
          if (damageType2 && damageType2 !== 'aftershock')
            damageType2 = undefined

          disabled = !!disabled

          return {
            tag: removeUndefinedFields({
              q,
              qt,
              attribute,
              damageType1,
              damageType2,
            }) as BonusStatTag,
            value,
            disabled,
          }
        }
      )
      .filter(notEmpty)

    if (!critModeKeys.includes(critMode)) critMode = 'avg'

    if (typeof enemyLvl !== 'number') enemyLvl = 80
    if (typeof enemyDef !== 'number') enemyDef = 953

    if (typeof enemyStunMultiplier !== 'number') enemyStunMultiplier = 150
    if (!Array.isArray(enemyStats)) enemyStats = []
    enemyStats = enemyStats
      .map(({ tag: { q, attribute }, value }) => {
        if (typeof value !== 'number') value = 0
        const q_ = validateValue(q, enemyStatKeys)
        if (!q_) return undefined
        q = q_

        if (attribute) attribute = validateValue(attribute, allAttributeKeys)

        return {
          tag: removeUndefinedFields({
            q,
            attribute,
          }) as EnemyStatsTag,
          value,
        }
      })
      .filter(notEmpty)

    if (!Array.isArray(teammates)) teammates = []
    teammates = teammates.reduce((acc: CharacterKey[], charKey) => {
      const charKey_ = validateValue(charKey, allCharacterKeys)

      if (!charKey_) return acc

      acc.push(charKey_)
      return acc
    }, [])

    if (optConfigId && !this.database.optConfigs.keys.includes(optConfigId))
      optConfigId = undefined

    const charOpt: CharOpt = {
      target,
      conditionals,
      bonusStats,
      teammates,
      critMode,

      enemyLvl,
      enemyDef,
      enemyStunMultiplier,
      enemyStats,

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
    disabled: boolean,
    index = -1 // to edit an existing stat
  ) {
    this.set(charKey, (charOpt) => {
      const bonusStats = [...charOpt.bonusStats]
      if (index === -1 && value !== null) {
        bonusStats.push({ tag, value, disabled })
      } else if (value === null && index > -1) {
        bonusStats.splice(index, 1)
      } else if (value !== null && index > -1) {
        bonusStats[index].value = value
        bonusStats[index].tag = tag
        bonusStats[index].disabled = disabled
      }
      return { bonusStats }
    })
  }
  setEnemyStat(
    charKey: CharacterKey,
    tag: EnemyStatsTag,
    value: number | null, // use null to remove the stat
    index?: number // to edit an existing stat
  ) {
    this.set(charKey, (charOpt) => {
      const statIndex =
        index ??
        charOpt.enemyStats.findIndex((s) => shallowCompareObj(s.tag, tag))
      const enemyStats = [...charOpt.enemyStats]
      if (statIndex === -1 && value !== null) {
        enemyStats.push({ tag, value })
      } else if (value === null && statIndex > -1) {
        enemyStats.splice(statIndex, 1)
      } else if (value !== null && statIndex > -1) {
        enemyStats[statIndex].value = value
        enemyStats[statIndex].tag = tag
      }
      return { enemyStats }
    })
  }
  setTeammate(
    charKey: CharacterKey,
    teammate: CharacterKey | null,
    index?: number
  ) {
    this.set(charKey, (charOpt) => {
      const teammateIndex =
        index ?? charOpt.teammates.findIndex((t) => t === teammate)
      const teammates = [...charOpt.teammates]
      if (teammateIndex === -1 && teammate !== null) {
        teammates.push(teammate)
      } else if (teammate === null && teammateIndex > -1) {
        teammates.splice(teammateIndex, 1)
      } else if (teammate !== null && teammateIndex > -1) {
        teammates[teammateIndex] = teammate
      }

      return { teammates }
    })
  }
}

export function initialCharOpt(): CharOpt {
  return {
    conditionals: [],
    bonusStats: [],
    teammates: [],
    critMode: 'avg',

    enemyLvl: 80,
    enemyDef: 953,
    enemyStunMultiplier: 150,
    enemyStats: [],
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
export function newEnemyStatTag(q: EnemyStatKey): EnemyStatsTag {
  return {
    q,
  }
}
