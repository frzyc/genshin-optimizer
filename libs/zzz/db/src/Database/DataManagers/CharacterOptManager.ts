import { notEmpty, shallowCompareObj } from '@genshin-optimizer/common/util'
import { correctConditionalValue } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type {
  DamageType,
  Dst,
  Sheet,
  Src,
  Tag,
} from '@genshin-optimizer/zzz/formula'
import {
  getConditional,
  getFormula,
  isMember,
} from '@genshin-optimizer/zzz/formula'
import type { ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'
import { validateTag } from '../tagUtil'

// Corresponds to the `own.common.critMode` libs\zzz\formula\src\data\common\dmg.ts
export type critModeKey = 'avg' | 'crit' | 'nonCrit'
export const critModeKeys: critModeKey[] = ['avg', 'crit', 'nonCrit'] as const

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

export type CharOpt = {
  targetSheet?: Sheet
  targetName?: string
  targetDamageType1?: SpecificDmgTypeKey
  targetDamageType2?: 'aftershock'

  conditionals: Array<{
    sheet: Sheet
    src: Src
    dst: Dst
    condKey: string
    condValue: number
  }>
  bonusStats: Array<{
    tag: Tag
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
      targetName,
      targetSheet,
      targetDamageType1,
      targetDamageType2,
      conditionals,
      bonusStats,
      critMode,

      enemyLvl,
      enemyDef,
      enemyisStunned,

      optConfigId,
    } = obj as CharOpt
    if (!Array.isArray(conditionals)) conditionals = []
    const hashList: string[] = [] // a hash to ensure sheet:condKey:src:dst is unique
    if (!targetSheet || !targetName || !getFormula(targetSheet, targetName)) {
      targetSheet = undefined
      targetName = undefined
    }
    if (
      targetName !== 'standardDmgInst' ||
      (targetDamageType1 && !isSpeicifcDmgTypeKey(targetDamageType1))
    )
      targetDamageType1 = undefined

    if (
      targetName !== 'standardDmgInst' ||
      (targetDamageType2 && targetDamageType2 !== 'aftershock')
    )
      targetDamageType2 = undefined

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
    bonusStats = bonusStats.filter(({ tag, value }) => {
      if (!validateTag(tag)) return false
      if (typeof value !== 'number') return false
      return true
    })

    if (!critModeKeys.includes(critMode)) critMode = 'avg'

    if (typeof enemyLvl !== 'number') enemyLvl = 80
    if (typeof enemyDef !== 'number') enemyDef = 953
    enemyisStunned = !!enemyisStunned

    if (optConfigId && !this.database.optConfigs.keys.includes(optConfigId))
      optConfigId = undefined

    const charOpt: CharOpt = {
      targetName,
      targetSheet,
      targetDamageType1,
      targetDamageType2,
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
    tag: Tag,
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
