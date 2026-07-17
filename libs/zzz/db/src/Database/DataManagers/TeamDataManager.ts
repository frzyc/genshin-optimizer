import {
  zodBoolean,
  zodEnumWithDefault,
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
  allAttributeKeys,
  allCharacterKeys,
  type CharacterKey,
} from '@genshin-optimizer/zzz/consts'
import type {
  DamageType,
  Dst,
  enemy,
  own,
  Sheet,
  Src,
  Tag,
} from '@genshin-optimizer/zzz/formula'
import {
  bundledFormulaInSheet,
  formulas,
  getConditional,
  isAbilityDim,
  isMember,
} from '@genshin-optimizer/zzz/formula'
import { z } from 'zod'
import type { ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'

export type critModeKey = 'avg' | 'crit' | 'nonCrit'
export const critModeKeys = ['avg', 'crit', 'nonCrit'] as const

export type SpecificDmgTypeKey = Exclude<
  DamageType,
  'anomaly' | 'disorder' | 'aftershock' | 'elemental' | 'vortex'
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
  'sheerForce',
  'cappedCrit_',
  'crit_dmg_',
  'pen_',
  'pen',
  'enerRegen',
  'anomProf',
  'anomMas',
  'dmg_',
] as const
export const targetQt = ['initial', 'final', 'common'] as const

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
  'abloom',
  'vortex',
] as const

export type TargetTag = {
  sheet?: string
  name?: string
  damageType1?: SpecificDmgTypeKey
  damageType2?: 'aftershock' | 'abloom'
  q?: string
  qt?: (typeof targetQt)[number]
  attribute?: AttributeKey
}

const targetTagSchema = z
  .object({
    sheet: z.string().optional(),
    name: z.string().optional(),
    damageType1: z.string().optional(),
    damageType2: z.literal('aftershock').or(z.literal('abloom')).optional(),
    q: z.string().optional(),
    qt: z.enum(targetQt).optional(),
    attribute: z.string().optional(),
  })
  .optional() as z.ZodType<TargetTag | undefined>

const conditionalSchema = z.object({
  sheet: z.string() as z.ZodType<Sheet>,
  src: z.string() as z.ZodType<Src>,
  dst: z.string().nullable() as z.ZodType<Dst>,
  condKey: z.string(),
  condValue: z.number(),
})

export type TeamConditional = z.infer<typeof conditionalSchema>

export type BonusStatTag = {
  q: BonusStatKey
  qt: (typeof bonusStatQtKeys)[number]
  attribute?: AttributeKey
  damageType1?: BonusStatDamageType
  damageType2?: 'aftershock' | 'abloom'
}

const bonusStatTagSchema = z.object({
  q: z.string(),
  qt: z.string(),
  attribute: z.string().optional(),
  damageType1: z.string().optional(),
  damageType2: z.literal('aftershock').or(z.literal('abloom')).optional(),
}) as z.ZodType<BonusStatTag>

const bonusStatSchema = z.object({
  tag: bonusStatTagSchema,
  value: z.number().catch(0),
  disabled: zodBoolean(),
})

export type TeamBonusStat = z.infer<typeof bonusStatSchema>

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

export type TeamEnemyStat = z.infer<typeof enemyStatSchema>

const optFrameSchema = z.object({
  tag: targetTagSchema,
  multiplier: z.number().positive().catch(1),
  critMode: zodEnumWithDefault(critModeKeys, 'avg'),
  bonusStats: z.array(bonusStatSchema).catch([]),
  conditionals: z.array(conditionalSchema).catch([]),
  enemyStats: z.array(enemyStatSchema).catch([]),
  description: z.string().optional(),
})

export type OptFrame = z.infer<typeof optFrameSchema>

const teammateDatumSchema = z.object({
  characterKey: z.enum(allCharacterKeys),
  optConfigId: z.string().optional(),
  // Future: build inforamtion like buildId, buildTcId, etc.
})

export type TeammateDatum = z.infer<typeof teammateDatumSchema>

const teamSchema = z.object({
  teammates: z.array(teammateDatumSchema).catch([]),
  frames: z.array(optFrameSchema).catch([]),
  enemyLvl: z.number().catch(80),
  enemyDef: z.number().catch(953),
  enemyStunMultiplier: z.number().catch(150),
})

export type Team = z.infer<typeof teamSchema>

export class TeamDataManager extends DataManager<
  CharacterKey,
  'teams',
  Team,
  Team
> {
  constructor(database: ZzzDatabase) {
    super(database, 'teams')
  }

  override validate(obj: unknown, key: CharacterKey): Team | undefined {
    const result = teamSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      teammates: rawTeammates,
      frames: rawFrames,
      enemyLvl,
      enemyDef,
      enemyStunMultiplier,
    } = result.data

    const teammates = this.validateTeammates(rawTeammates, key)
    if (!teammates) return undefined

    const frames = rawFrames
      .map((frame) => this.validateOptFrame(frame))
      .filter(notEmpty)

    return {
      teammates,
      frames,
      enemyLvl,
      enemyDef,
      enemyStunMultiplier,
    }
  }

  private validateTeammates(
    rawTeammates: TeammateDatum[],
    cacheKey: CharacterKey
  ): TeammateDatum[] | undefined {
    if (rawTeammates.length > 3) return undefined
    if (rawTeammates[0]?.characterKey !== cacheKey) return undefined

    const seen = new Set<CharacterKey>()
    const teammates: TeammateDatum[] = []

    for (const raw of rawTeammates) {
      if (seen.has(raw.characterKey)) continue
      seen.add(raw.characterKey)

      const optConfigId =
        raw.optConfigId &&
        this.database.optConfigs.keys.includes(raw.optConfigId)
          ? raw.optConfigId
          : undefined

      teammates.push({
        characterKey: raw.characterKey,
        optConfigId,
      })
    }

    return teammates
  }

  private validateOptFrame(raw: OptFrame): OptFrame | undefined {
    const result = optFrameSchema.safeParse(raw)
    if (!result.success) return undefined

    const {
      tag: rawTarget,
      multiplier,
      critMode,
      bonusStats: rawBonusStats,
      conditionals: rawConditionals,
      enemyStats: rawEnemyStats,
      description,
    } = result.data

    const tag = this.validateTargetTag(rawTarget)
    const bonusStats = this.validateBonusStats(rawBonusStats)
    const conditionals = this.validateConditionals(rawConditionals)
    const enemyStats = this.validateEnemyStats(rawEnemyStats)

    return {
      tag,
      multiplier,
      critMode,
      bonusStats,
      conditionals,
      enemyStats,
      description,
    }
  }

  private validateEnemyStats(rawEnemyStats: TeamEnemyStat[]): TeamEnemyStat[] {
    return rawEnemyStats
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
  }

  private validateTargetTag(
    rawTarget: TargetTag | undefined
  ): TargetTag | undefined {
    if (!rawTarget) return undefined

    if (rawTarget.name) {
      const sheet = rawTarget.sheet ?? resolveFormulaSheet(rawTarget)
      const formula = getFormula({ ...rawTarget, sheet })
      if (formula) {
        const abilityName = formula.tag.name
        if (!abilityName) return undefined
        let damageType1: SpecificDmgTypeKey | undefined
        let damageType2: 'aftershock' | 'abloom' | undefined
        if (
          abilityName === 'standardDmgInst' ||
          abilityName === 'sheerDmgInst'
        ) {
          if (
            rawTarget.damageType1 &&
            isSpecificDmgTypeKey(rawTarget.damageType1)
          )
            damageType1 = rawTarget.damageType1
          if (
            rawTarget.damageType2 === 'aftershock' ||
            rawTarget.damageType2 === 'abloom'
          )
            damageType2 = rawTarget.damageType2
        }
        const q = rawTarget.q ?? formula.tag.q ?? undefined
        return removeUndefinedFields({
          sheet: sheet ?? formula.sheet,
          name: abilityName,
          q,
          damageType1,
          damageType2,
        }) as TargetTag
      }
      return undefined
    }

    const { q, qt, attribute } = rawTarget
    if (
      q &&
      qt &&
      (targetQ as readonly string[]).includes(q) &&
      targetQt.includes(qt)
    ) {
      let validAttribute: AttributeKey | undefined
      if (q === 'dmg_' && attribute) {
        validAttribute = validateValue(attribute, allAttributeKeys) as
          | AttributeKey
          | undefined
        if (!validAttribute) return undefined
      }
      return removeUndefinedFields({
        q,
        qt,
        attribute: validAttribute,
      }) as TargetTag
    }
    return undefined
  }

  private validateConditionals(
    rawConditionals: TeamConditional[]
  ): TeamConditional[] {
    const hashList: string[] = []
    return rawConditionals
      .map(({ sheet, condKey, src, dst, condValue }) => {
        if (!condValue) return undefined
        if (!isMember(src) || !(dst === null || isMember(dst))) return undefined
        const cond = getConditional(sheet, condKey)
        if (!cond) return undefined

        const hash = `${sheet}:${condKey}:${src}:${dst}`
        if (hashList.includes(hash)) return undefined
        hashList.push(hash)

        return {
          sheet,
          src,
          dst,
          condKey,
          condValue: correctConditionalValue(cond, condValue),
        }
      })
      .filter(notEmpty)
  }

  private validateBonusStats(rawBonusStats: TeamBonusStat[]): TeamBonusStat[] {
    return rawBonusStats
      .map(({ tag, value, disabled }) => {
        const q = validateValue(tag.q, bonusStatKeys)
        const qt = validateValue(tag.qt, bonusStatQtKeys)
        if (!q || !qt) return undefined

        let { attribute, damageType1, damageType2 } = tag

        if (q !== 'dmg_' && q !== 'sheer_dmg_' && q !== 'resIgn_')
          attribute = undefined
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
        if (
          damageType2 &&
          damageType2 !== 'aftershock' &&
          damageType2 !== 'abloom'
        )
          damageType2 = undefined

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
  }

  override toStorageKey(key: string): string {
    return `${this.goKeySingle}_${key}`
  }
  override toCacheKey(key: string): CharacterKey {
    return key.split(`${this.goKeySingle}_`)[1] as CharacterKey
  }

  getOrCreate(key: CharacterKey): Team {
    if (!this.keys.includes(key)) {
      this.set(key, initialTeam(key))
    }
    return this.get(key) as Team
  }

  setFrameConditional(
    teamKey: CharacterKey,
    frameIndex: number,
    sheet: Sheet,
    condKey: string,
    src: Src,
    dst: Dst,
    condValue: number
  ) {
    this.set(teamKey, (team) => {
      const frames = [...team.frames]
      const frame = frames[frameIndex]
      if (!frame) return false

      const conditionals = [...frame.conditionals]
      const condIndex = conditionals.findIndex(
        (c) =>
          c.condKey === condKey &&
          c.sheet === sheet &&
          c.src === src &&
          c.dst === dst
      )
      if (condIndex === -1) {
        conditionals.push({ sheet, src, dst, condKey, condValue })
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
      frames[frameIndex] = { ...frame, conditionals }
      return { frames }
    })
  }

  setFrameBonusStat(
    teamKey: CharacterKey,
    frameIndex: number,
    tag: BonusStatTag,
    value: number | null,
    disabled: boolean,
    index = -1
  ) {
    this.set(teamKey, (team) => {
      const frames = [...team.frames]
      const frame = frames[frameIndex]
      if (!frame) return false

      const bonusStats = [...frame.bonusStats]
      if (index === -1 && value !== null) {
        bonusStats.push({ tag, value, disabled })
      } else if (value === null && index >= 0 && index < bonusStats.length) {
        bonusStats.splice(index, 1)
      } else if (value !== null && index >= 0 && index < bonusStats.length) {
        bonusStats[index].value = value
        bonusStats[index].tag = tag
        bonusStats[index].disabled = disabled
      }
      frames[frameIndex] = { ...frame, bonusStats }
      return { frames }
    })
  }

  setFrameEnemyStat(
    teamKey: CharacterKey,
    frameIndex: number,
    tag: EnemyStatsTag,
    value: number | null,
    index?: number
  ) {
    this.set(teamKey, (team) => {
      const frames = [...team.frames]
      const frame = frames[frameIndex]
      if (!frame) return false

      const statIndex =
        index ??
        frame.enemyStats.findIndex((s) => shallowCompareObj(s.tag, tag))
      const enemyStats = [...frame.enemyStats]
      if (statIndex === -1 && value !== null) {
        enemyStats.push({ tag, value })
      } else if (
        value === null &&
        statIndex >= 0 &&
        statIndex < enemyStats.length
      ) {
        enemyStats.splice(statIndex, 1)
      } else if (
        value !== null &&
        statIndex >= 0 &&
        statIndex < enemyStats.length
      ) {
        enemyStats[statIndex].value = value
        enemyStats[statIndex].tag = tag
      }
      frames[frameIndex] = { ...frame, enemyStats }
      return { frames }
    })
  }

  setFrame0(
    teamKey: CharacterKey,
    update: Partial<OptFrame> | ((frame: OptFrame) => Partial<OptFrame> | false)
  ) {
    this.set(teamKey, (team) => {
      const frame0 = getTeamFrame0(team)
      const patch = typeof update === 'function' ? update(frame0) : update
      if (patch === false) return false
      const frames = [...team.frames]
      frames[0] = { ...frame0, ...patch }
      return { frames }
    })
  }

  setTeammateOptConfigId(
    teamKey: CharacterKey,
    characterKey: CharacterKey,
    optConfigId: string
  ) {
    this.set(teamKey, (team) => ({
      teammates: team.teammates.map((t) =>
        t.characterKey === characterKey ? { ...t, optConfigId } : t
      ),
    }))
  }

  /** UI picker index 0–1 maps to teammates slots [1] and [2]. */
  setTeammate(
    teamKey: CharacterKey,
    teammate: CharacterKey | null,
    uiPickerIndex?: number
  ) {
    this.set(teamKey, (team) => {
      const slotIndex =
        uiPickerIndex === undefined
          ? team.teammates.findIndex((t) => t.characterKey === teammate)
          : uiPickerIndex + 1

      if (slotIndex < 1) return false

      const teammates = [...team.teammates]

      if (teammate === null && slotIndex > 0 && slotIndex < teammates.length) {
        teammates.splice(slotIndex, 1)
      } else if (teammate !== null) {
        const existing = teammates.find((t) => t.characterKey === teammate)
        if (existing && teammates.indexOf(existing) !== slotIndex) {
          teammates.splice(teammates.indexOf(existing), 1)
        }
        if (slotIndex < teammates.length) {
          teammates[slotIndex] = {
            ...teammates[slotIndex],
            characterKey: teammate,
          }
        } else if (teammates.length < 3) {
          teammates.push({ characterKey: teammate })
        }
      }

      return { teammates }
    })
  }
}

const emptyFrame0 = (): OptFrame => ({
  tag: undefined,
  multiplier: 1,
  critMode: 'avg',
  bonusStats: [],
  conditionals: [],
  enemyStats: [],
})

// for the current implementation the team is limited to only the first frame.
export function getTeamFrame0(team: Team): OptFrame {
  return team.frames[0] ?? emptyFrame0()
}

export function initialTeam(mainKey: CharacterKey): Team {
  return {
    teammates: [{ characterKey: mainKey, optConfigId: undefined }],
    frames: [emptyFrame0()],
    enemyLvl: 80,
    enemyDef: 953,
    enemyStunMultiplier: 150,
  }
}

// for the current implementation, the opt is only for the first/main character
export function getMainCharacterKey(team: Team): CharacterKey {
  return team.teammates[0].characterKey
}
export function getMainCharacterOptConfigId(team: Team): string | undefined {
  return team.teammates[0].optConfigId
}

export function findTeammate(
  team: Team,
  characterKey: CharacterKey
): TeammateDatum | undefined {
  return team.teammates.find((t) => t.characterKey === characterKey)
}

export function getTeamOptConfigId(
  team: Team,
  characterKey: CharacterKey
): string | undefined {
  return findTeammate(team, characterKey)?.optConfigId
}

export function teamCharacterKeys(team: Team): CharacterKey[] {
  return team.teammates.map((t) => t.characterKey)
}

export function teamToSolverFrames(team: Team) {
  return team.frames
    .map(({ tag, multiplier }) =>
      tag
        ? {
            tag: targetTag(tag),
            multiplier,
          }
        : undefined
    )
    .filter(notEmpty)
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

function resolveFormulaSheet(target: {
  name?: string
  sheet?: string
  q?: string
}): Sheet | undefined {
  const { name, q, sheet } = target
  if (!name) return undefined

  const matches = (charSheet: string) => {
    const sheetFormulas = (formulas as Record<string, Record<string, unknown>>)[
      charSheet
    ]
    if (!sheetFormulas) return false
    if (q) {
      if (isAbilityDim(q))
        return !!bundledFormulaInSheet(
          sheetFormulas as Record<string, { tag?: Tag }>,
          name,
          q
        )
      return Object.values(sheetFormulas).some(
        (entry) =>
          (entry as { tag?: Tag }).tag?.name === name &&
          (entry as { tag?: Tag }).tag?.q === q
      )
    }
    return !!sheetFormulas[name]
  }

  if (
    sheet &&
    allCharacterKeys.includes(sheet as CharacterKey) &&
    matches(sheet)
  )
    return sheet as Sheet

  for (const charSheet of allCharacterKeys) {
    if (matches(charSheet)) return charSheet as Sheet
  }
  return undefined
}

function getFormula(target: TargetTag) {
  const { name, q, sheet: sheetHint } = target
  if (!name) return
  const sheet = sheetHint ?? resolveFormulaSheet(target)
  if (!sheet) return
  const sheetFormulas = (formulas as any)[sheet] as
    | Record<
        string,
        {
          sheet: Sheet
          name: string
          tag: Tag
        }
      >
    | undefined
  if (!sheetFormulas) return

  if (q) {
    if (isAbilityDim(q)) return bundledFormulaInSheet(sheetFormulas, name, q)
    const byTagQ = Object.values(sheetFormulas).find(
      (entry) => entry.tag?.name === name && entry.tag?.q === q
    )
    if (byTagQ) return byTagQ
    return undefined
  }

  return sheetFormulas[name]
}

export function targetTag(target: TargetTag): Tag {
  const { damageType1, damageType2, attribute } = target
  const formula = getFormula(target)
  if (formula)
    return applyDamageTypeToTag(formula.tag, damageType1, damageType2)
  const qt = target.qt ?? 'final'
  return {
    et: 'own',
    q: target.q ?? 'atk',
    qt,
    sheet: qt === 'common' ? 'iso' : 'agg',
    ...(attribute ? { attribute } : {}),
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
