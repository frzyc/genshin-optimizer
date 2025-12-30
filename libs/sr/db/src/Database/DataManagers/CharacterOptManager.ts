import { zodBoolean } from '@genshin-optimizer/common/database'
import { notEmpty, shallowCompareObj } from '@genshin-optimizer/common/util'
import { correctConditionalValue } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { Dst, Sheet, Src, Tag } from '@genshin-optimizer/sr/formula'
import { getConditional, isMember } from '@genshin-optimizer/sr/formula'
import { z } from 'zod'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import { validateTag } from '../tagUtil'

const tagSchema = z.record(z.string(), z.unknown()) as z.ZodType<Tag>

const conditionalSchema = z.object({
  sheet: z.string() as z.ZodType<Sheet>,
  src: z.string() as z.ZodType<Src>,
  dst: z.string().nullable() as z.ZodType<Dst>,
  condKey: z.string(),
  condValue: z.number(),
})

const bonusStatSchema = z.object({
  tag: tagSchema,
  value: z.number(),
})

const statConstraintSchema = z.object({
  tag: tagSchema,
  value: z.number(),
  isMax: zodBoolean(),
})

const charOptSchema = z.object({
  target: tagSchema,
  conditionals: z.array(conditionalSchema).catch([]),
  bonusStats: z.array(bonusStatSchema).catch([]),
  statConstraints: z.array(statConstraintSchema).catch([]),
  optConfigId: z.string().optional(),
})

export type CharOpt = z.infer<typeof charOptSchema>

export class CharacterOptManager extends DataManager<
  CharacterKey,
  'charOpts',
  CharOpt,
  CharOpt
> {
  constructor(database: SroDatabase) {
    super(database, 'charOpts')
  }
  override validate(obj: unknown, key: CharacterKey): CharOpt | undefined {
    const result = charOptSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      target: rawTarget,
      conditionals: rawConditionals,
      bonusStats: rawBonusStats,
      statConstraints: rawStatConstraints,
      optConfigId: rawOptConfigId,
    } = result.data

    // Validate target
    const target = validateTag(rawTarget) ? rawTarget : defOptTarget(key)

    // Validate conditionals
    const hashList: string[] = []
    const conditionals = rawConditionals
      .map(({ sheet, condKey, src, dst, condValue }) => {
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
    const bonusStats = rawBonusStats.filter(
      ({ tag, value }) => validateTag(tag) && typeof value === 'number'
    )

    // Validate statConstraints
    const statConstraints = rawStatConstraints.filter(
      ({ tag, value, isMax }) =>
        validateTag(tag) &&
        typeof value === 'number' &&
        typeof isMax === 'boolean'
    )

    // Validate optConfigId
    const optConfigId =
      rawOptConfigId && this.database.optConfigs.keys.includes(rawOptConfigId)
        ? rawOptConfigId
        : undefined

    return {
      target,
      conditionals,
      bonusStats,
      statConstraints,
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
      this.set(key, initialCharOpt(key))
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
    tag: Tag,
    value: number | null,
    index?: number
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

function defOptTarget(key: CharacterKey): Tag {
  return {
    src: key,
    et: 'own',
    qt: 'final',
    q: 'spd',
    sheet: 'agg',
  }
}

export function initialCharOpt(key: CharacterKey): CharOpt {
  return {
    target: defOptTarget(key),
    conditionals: [],
    bonusStats: [],
    statConstraints: [],
    optConfigId: undefined,
  }
}
