import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
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
import { z } from 'zod'
import type { ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'

export type critModeKey = 'avg' | 'crit' | 'nonCrit'
export const critModeKeys = ['avg', 'crit', 'nonCrit'] as const

export type SpecificDmgTypeKey = Exclude<
  DamageType,
  'anomaly' | 'disorder' | 'aftershock' | 'elemental'
>
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

function isSpecificDmgTypeKey(key: string): key is SpecificDmgTypeKey {
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

export type TargetTag = {
  sheet?: string
  name?: string
  damageType1?: SpecificDmgTypeKey
  damageType2?: 'aftershock'
  q?: (typeof targetQ)[number]
  qt?: (typeof targetQt)[number]
}

const targetTagSchema = z
  .object({
    sheet: z.string().optional(),
    name: z.string().optional(),
    damageType1: z.string().optional(),
    damageType2: z.literal('aftershock').optional(),
    q: z.enum(targetQ).optional(),
    qt: z.enum(targetQt).optional(),
  })
  .optional() as z.ZodType<TargetTag | undefined>

const conditionalSchema = z.object({
  sheet: z.string() as z.ZodType<Sheet>,
  src: z.string() as z.ZodType<Src>,
  dst: z.string().nullable() as z.ZodType<Dst>,
  condKey: z.string(),
  condValue: z.number(),
})

export type BonusStatTag = {
  q: BonusStatKey
  qt: (typeof bonusStatQtKeys)[number]
  attribute?: AttributeKey
  damageType1?: BonusStatDamageType
  damageType2?: 'aftershock'
}

const bonusStatTagSchema = z.object({
  q: z.string(),
  qt: z.string(),
  attribute: z.string().optional(),
  damageType1: z.string().optional(),
  damageType2: z.literal('aftershock').optional(),
}) as z.ZodType<BonusStatTag>

const bonusStatSchema = z.object({
  tag: bonusStatTagSchema,
  value: z.number().catch(0),
  disabled: zodBoolean(),
})

export type EnemyStatsTag = {
  q: EnemyStatKey
  attribute?: AttributeKey
}

const enemyStatsTagSchema = z.object({
  q: z.string(),
  attribute: z.string().optional(),
}) as z.ZodType<EnemyStatsTag>

const enemyStatSchema = z.object({
  tag: enemyStatsTagSchema,
  value: z.number().catch(0),
})

const charOptSchema = z.object({
  target: targetTagSchema,
  conditionals: z.array(conditionalSchema).catch([]),
  bonusStats: z.array(bonusStatSchema).catch([]),
  teammates: zodFilteredArray(allCharacterKeys, []) as z.ZodType<
    CharacterKey[]
  >,
  critMode: zodEnumWithDefault(critModeKeys, 'avg'),

  enemyLvl: z.number().catch(80),
  enemyDef: z.number().catch(953),
  enemyStunMultiplier: z.number().catch(150),
  enemyStats: z.array(enemyStatSchema).catch([]),

  optConfigId: z.string().optional(),
})

export type CharOpt = z.infer<typeof charOptSchema>

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
    const result = charOptSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      target: rawTarget,
      conditionals: rawConditionals,
      bonusStats: rawBonusStats,
      teammates: rawTeammates,
      critMode,
      enemyLvl,
      enemyDef,
      enemyStunMultiplier,
      enemyStats: rawEnemyStats,
      optConfigId: rawOptConfigId,
    } = result.data

    // Validate target for formula
    let target: TargetTag | undefined
    if (rawTarget?.name) {
      const formula = getFormula(rawTarget as TargetTag)
      if (formula) {
        let damageType1: SpecificDmgTypeKey | undefined
        let damageType2: 'aftershock' | undefined
        if (
          formula.name === 'standardDmgInst' ||
          formula.name === 'sheerDmgInst'
        ) {
          if (
            rawTarget.damageType1 &&
            isSpecificDmgTypeKey(rawTarget.damageType1)
          )
            damageType1 = rawTarget.damageType1
          if (rawTarget.damageType2 === 'aftershock')
            damageType2 = rawTarget.damageType2
        }
        target = removeUndefinedFields({
          sheet: formula.sheet,
          name: formula.name,
          damageType1,
          damageType2,
        }) as TargetTag
      }
    } else if (rawTarget) {
      const { q, qt } = rawTarget
      if (q && qt && targetQ.includes(q) && targetQt.includes(qt)) {
        target = { q, qt }
      }
    }

    // Validate conditionals
    const hashList: string[] = []
    const conditionals = rawConditionals
      .map(({ sheet, condKey, src, dst, condValue }) => {
        if (!condValue) return undefined
        if (!isMember(src) || !(dst === null || isMember(dst))) return undefined
        const cond = getConditional(sheet, condKey)
        if (!cond) return undefined

        const hash = `${sheet}:${condKey}:${src}:${dst}`
        if (hashList.includes(hash)) return undefined
        hashList.push(hash)

        const correctedCondValue = correctConditionalValue(cond, condValue)

        return {
          sheet,
          src,
          dst,
          condKey,
          condValue: correctedCondValue,
        }
      })
      .filter(notEmpty)

    // Validate bonusStats
    const bonusStats = rawBonusStats
      .map(({ tag, value, disabled }) => {
        const q = validateValue(tag.q, bonusStatKeys)
        const qt = validateValue(tag.qt, bonusStatQtKeys)
        if (!q || !qt) return undefined

        let { attribute, damageType1, damageType2 } = tag

        if (q !== 'dmg_') attribute = undefined
        if (attribute)
          attribute = validateValue(attribute, allAttributeKeys) as
            | AttributeKey
            | undefined

        if (
          !bonusStatDmgTypeIncStats.includes(
            q as (typeof bonusStatDmgTypeIncStats)[number]
          )
        )
          damageType1 = undefined
        if (damageType1)
          damageType1 = validateValue(damageType1, bonusStatDamageTypes) as
            | BonusStatDamageType
            | undefined

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
          disabled,
        }
      })
      .filter(notEmpty)

    // Validate enemyStats
    const enemyStats = rawEnemyStats
      .map(({ tag, value }) => {
        const q = validateValue(tag.q, enemyStatKeys)
        if (!q) return undefined

        let { attribute } = tag
        if (attribute)
          attribute = validateValue(attribute, allAttributeKeys) as
            | AttributeKey
            | undefined

        return {
          tag: removeUndefinedFields({
            q,
            attribute,
          }) as EnemyStatsTag,
          value,
        }
      })
      .filter(notEmpty)

    // Validate teammates (limit to 2)
    const teammates = rawTeammates.slice(0, 2) as CharacterKey[]

    // Validate optConfigId
    const optConfigId =
      rawOptConfigId && this.database.optConfigs.keys.includes(rawOptConfigId)
        ? rawOptConfigId
        : undefined

    return {
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
  }

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
    value: number | null,
    disabled: boolean,
    index = -1
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
    value: number | null,
    index?: number
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
    target: undefined,
    conditionals: [],
    bonusStats: [],
    teammates: [],
    critMode: 'avg',

    enemyLvl: 80,
    enemyDef: 953,
    enemyStunMultiplier: 150,
    enemyStats: [],
    optConfigId: undefined,
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
