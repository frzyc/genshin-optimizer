import {
  zodBoolean,
  zodEnumWithDefault,
  zodString,
} from '@genshin-optimizer/common/database'
import {
  notEmpty,
  objKeyMap,
  pruneOrPadArray,
  range,
  shallowCompareObj,
} from '@genshin-optimizer/common/util'
import { correctConditionalValue } from '@genshin-optimizer/game-opt/engine'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'
import type { Dst, Src } from '@genshin-optimizer/sr/formula'
import {
  type Sheet,
  type Tag,
  getConditional,
  isMember,
} from '@genshin-optimizer/sr/formula'
import { z } from 'zod'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import { validateTag } from '../tagUtil'
import type { RelicIds } from './BuildDataManager'

// --- Schemas ---

const buildTypeKeys = ['equipped', 'real', 'tc'] as const

const teammateDatumSchema = z.object({
  characterKey: z.enum(allCharacterKeys),
  buildType: zodEnumWithDefault(buildTypeKeys, 'equipped'),
  buildId: zodString(),
  buildTcId: zodString(),
  compare: zodBoolean(),
  compareType: zodEnumWithDefault(buildTypeKeys, 'equipped'),
  compareBuildId: zodString(),
  compareBuildTcId: zodString(),
  optConfigId: z.string().optional(),
})

export type TeammateDatum = z.infer<typeof teammateDatumSchema>

const frameSchema = z.object({
  tag: z.record(z.string(), z.unknown()) as z.ZodType<Tag>,
  multiplier: z.number().catch(1),
  description: z.string().optional(),
})

export type Frame = z.infer<typeof frameSchema>

const conditionalSchema = z.object({
  sheet: z.string() as z.ZodType<Sheet>,
  src: z.string() as z.ZodType<Src>,
  dst: z.string().nullable() as z.ZodType<Dst>,
  condKey: z.string(),
  condValues: z.array(z.number()),
})

const bonusStatSchema = z.object({
  tag: z.record(z.string(), z.unknown()) as z.ZodType<Tag>,
  values: z.array(z.number()),
})

const statConstraintSchema = z.object({
  tag: z.record(z.string(), z.unknown()) as z.ZodType<Tag>,
  values: z.array(z.number()),
  isMaxs: z.array(z.boolean()),
})

const teamSchema = z.object({
  name: z.string().catch('Team Name'),
  description: zodString(),
  lastEdit: z.number().catch(Date.now()),
  frames: z.array(frameSchema).catch([]),
  conditionals: z.array(conditionalSchema).catch([]),
  bonusStats: z.array(bonusStatSchema).catch([]),
  statConstraints: z.array(statConstraintSchema).catch([]),
  teamMetadata: z
    .array(teammateDatumSchema.optional())
    .catch(range(0, 3).map(() => undefined)),
})

export type Team = z.infer<typeof teamSchema>

export class TeamDataManager extends DataManager<string, 'teams', Team, Team> {
  constructor(database: SroDatabase) {
    super(database, 'teams')
  }
  newName() {
    const existing = this.values
    for (let num = existing.length + 1; num <= existing.length * 2; num++) {
      const name = `Team Name ${num}`
      if (existing.some((tc) => tc.name !== name)) return name
    }
    return `Team Name`
  }
  override validate(obj: unknown): Team | undefined {
    const result = teamSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      name: rawName,
      description,
      teamMetadata,
      lastEdit,
      frames,
      conditionals,
      bonusStats,
      statConstraints,
    } = result.data

    const name = rawName === 'Team Name' ? this.newName() : rawName

    // Validate teamMetadata - apply business logic for database references
    const validatedTeamMetadata = range(0, 3).map((ind) => {
      const teammateDatum = teamMetadata[ind]
      if (!teammateDatum) return undefined

      const {
        characterKey,
        buildType: rawBuildType,
        buildId: rawBuildId,
        buildTcId: rawBuildTcId,
        compare,
        compareType: rawCompareType,
        compareBuildId: rawCompareBuildId,
        compareBuildTcId: rawCompareBuildTcId,
        optConfigId: rawOptConfigId,
      } = teammateDatum

      if (!allCharacterKeys.includes(characterKey)) return undefined

      // Validate buildId exists in database
      const buildId = this.database.builds.keys.includes(rawBuildId)
        ? rawBuildId
        : ''
      const buildTcId = this.database.buildTcs.keys.includes(rawBuildTcId)
        ? rawBuildTcId
        : ''

      // Fix buildType if the referenced build doesn't exist
      let buildType = rawBuildType
      if (
        (!buildId && !buildTcId) ||
        (buildType === 'real' && !buildId) ||
        (buildType === 'tc' && !buildTcId)
      )
        buildType = 'equipped'

      // Validate compare builds
      let compareType = rawCompareType
      let compareBuildId = rawCompareBuildId
      let compareBuildTcId = rawCompareBuildTcId
      if (!this.database.builds.keys.includes(compareBuildId)) {
        compareBuildId = ''
        if (compareType === 'real') compareType = 'equipped'
      }

      if (!this.database.buildTcs.keys.includes(compareBuildTcId)) {
        compareBuildTcId = ''
        if (compareType === 'tc') compareType = 'equipped'
      }

      // Validate optConfigId
      const optConfigId =
        rawOptConfigId && this.database.optConfigs.keys.includes(rawOptConfigId)
          ? rawOptConfigId
          : undefined

      return {
        characterKey,
        buildType,
        buildId,
        buildTcId,
        compare,
        compareType,
        compareBuildId,
        compareBuildTcId,
        optConfigId,
      } as TeammateDatum
    })

    // Validate frames
    const validatedFrames = frames
      .map((f) => {
        const { tag, description } = f
        const multiplier = f.multiplier === 0 ? 1 : f.multiplier
        if (!validateTag(tag as Tag)) return undefined
        return { tag: tag as Tag, multiplier, description }
      })
      .filter(notEmpty)

    const framesLength = validatedFrames.length

    // Validate conditionals, bonusStats, statConstraints based on frames length
    let validatedConditionals: Team['conditionals'] = []
    let validatedBonusStats: Team['bonusStats'] = []
    let validatedStatConstraints: Team['statConstraints'] = []

    if (framesLength > 0) {
      const hashList: string[] = []
      validatedConditionals = conditionals.filter((cond) => {
        const { sheet, condKey, src, dst, condValues } = cond
        if (!isMember(src as Src)) return false
        if (dst !== null && !isMember(dst)) return false
        const condDef = getConditional(sheet as Sheet, condKey)
        if (!condDef) return false

        const hash = `${sheet}:${condKey}:${src}:${dst}`
        if (hashList.includes(hash)) return false
        hashList.push(hash)

        if (!Array.isArray(condValues)) return false
        pruneOrPadArray(condValues, framesLength, 0)
        const corrected = condValues.map((v) =>
          correctConditionalValue(condDef, v)
        )
        if (corrected.every((v) => !v)) return false

        return true
      })

      validatedBonusStats = bonusStats.filter(({ tag, values }) => {
        if (!validateTag(tag as Tag)) return false
        if (!Array.isArray(values)) return false
        pruneOrPadArray(values, framesLength, 0)
        return true
      })

      validatedStatConstraints = statConstraints.filter(
        ({ tag, values, isMaxs }) => {
          if (!validateTag(tag as Tag)) return false
          if (!Array.isArray(values)) return false
          pruneOrPadArray(values, framesLength, 0)
          if (!Array.isArray(isMaxs)) return false
          pruneOrPadArray(isMaxs, framesLength, false)
          return true
        }
      )
    }

    return {
      name,
      description,
      teamMetadata: validatedTeamMetadata,
      lastEdit,
      frames: validatedFrames,
      conditionals: validatedConditionals,
      bonusStats: validatedBonusStats,
      statConstraints: validatedStatConstraints,
    }
  }

  new(value: Partial<Team> = {}): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(teamId: string, notify?: boolean): Team | undefined {
    const rem = super.remove(teamId, notify)
    if (!rem) return
    rem.teamMetadata.forEach((teammateDatum) => {
      teammateDatum?.optConfigId &&
        this.database.optConfigs.remove(teammateDatum?.optConfigId)
    })
    return rem
  }
  override clear(): void {
    super.clear()
  }

  getTeamActiveBuild({ characterKey, buildType, buildId }: TeammateDatum): {
    relicIds: RelicIds
    lightConeId: string | undefined
  } {
    const def = {
      relicIds: objKeyMap(allRelicSlotKeys, () => undefined),
      lightConeId: undefined,
    }
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return def
        return {
          relicIds: char.equippedRelics,
          lightConeId: char.equippedLightCone,
        }
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return def
        return {
          relicIds: build.relicIds,
          lightConeId: build.lightConeId,
        }
      }
      case 'tc': {
        return def
      }
    }
  }
  getActiveBuildName(
    { buildType, buildId, buildTcId }: TeammateDatum,
    equippedName = 'Equipped Build'
  ) {
    switch (buildType) {
      case 'equipped':
        return equippedName
      case 'real':
        return this.database.builds.get(buildId)?.name ?? ''
      case 'tc':
        return this.database.buildTcs.get(buildTcId)?.name ?? ''
    }
  }

  followTeamDatum(
    { buildType, buildId, buildTcId }: TeammateDatum,
    callback: () => void
  ) {
    if (buildType === 'real') {
      const build = this.database.builds.get(buildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(buildId, callback)
      const unfollowLightCone = build.lightConeId
        ? this.database.lightCones.follow(build.lightConeId, callback)
        : () => {}
      const unfollowRelics = Object.values(build.relicIds).map((id) =>
        id ? this.database.relics.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowLightCone()
        unfollowRelics.forEach((unfollow) => unfollow())
      }
    } else if (buildType === 'tc')
      return this.database.buildTcs.follow(buildTcId, callback)
    return () => {}
  }
  followTeamDatumCompare(
    { compareType, compareBuildId, compareBuildTcId }: TeammateDatum,
    callback: () => void
  ) {
    if (compareType === 'real') {
      const build = this.database.builds.get(compareBuildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(
        compareBuildId,
        callback
      )
      const unfollowLightCone = build.lightConeId
        ? this.database.lightCones.follow(build.lightConeId, callback)
        : () => {}
      const unfollowRelics = Object.values(build.relicIds).map((id) =>
        id ? this.database.relics.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowLightCone()
        unfollowRelics.forEach((unfollow) => unfollow())
      }
    } else if (compareType === 'tc')
      return this.database.buildTcs.follow(compareBuildTcId, callback)
    return () => {}
  }

  setConditional(
    teamId: string,
    sheet: Sheet,
    condKey: string,
    src: Src,
    dst: Dst,
    condValue: number,
    frameIndex: number
  ) {
    this.set(teamId, (team) => {
      if (frameIndex > team.frames.length) return false
      const condIndex = team.conditionals.findIndex(
        (c) =>
          c.condKey === condKey &&
          c.sheet === sheet &&
          c.src === src &&
          c.dst === dst
      )
      if (condIndex === -1) {
        const condValues = new Array(team.frames.length).fill(0)
        condValues[frameIndex] = condValue
        team.conditionals.push({
          sheet,
          src,
          dst,
          condKey,
          condValues,
        })
      } else {
        const cond = team.conditionals[condIndex]
        if (
          cond.sheet === sheet &&
          cond.src === src &&
          cond.dst === dst &&
          cond.condKey === condKey &&
          cond.condValues[frameIndex] === condValue
        )
          return false
        cond.sheet = sheet
        cond.src = src
        cond.dst = dst
        cond.condKey = condKey
        cond.condValues[frameIndex] = condValue
      }
      return team
    })
  }
  setBonusStat(
    teamId: string,
    tag: Tag,
    value: number | null,
    frameIndex: number
  ) {
    this.set(teamId, (team) => {
      if (frameIndex > team.frames.length) return
      const statIndex = team.bonusStats.findIndex((s) =>
        shallowCompareObj(s.tag, tag)
      )
      if (statIndex === -1 && value !== null) {
        const values = new Array(team.frames.length).fill(0)
        values[frameIndex] = value
        team.bonusStats.push({ tag, values })
      } else if (value === null && statIndex > -1) {
        team.bonusStats.splice(statIndex, 1)
      } else if (value !== null && statIndex > -1) {
        team.bonusStats[statIndex].values[frameIndex] = value
      }
    })
  }
  setStatConstraint(
    teamId: string,
    tag: Tag,
    value: number | null,
    isMax: boolean,
    frameIndex: number
  ) {
    this.set(teamId, (team) => {
      if (frameIndex > team.frames.length) return
      const statIndex = team.statConstraints.findIndex((s) =>
        shallowCompareObj(s.tag, tag)
      )
      if (statIndex === -1 && value !== null) {
        const values = new Array(team.frames.length).fill(0)
        values[frameIndex] = value
        const isMaxs = new Array(team.frames.length).fill(false)
        isMaxs[frameIndex] = isMax
        team.statConstraints.push({ tag, values, isMaxs })
      } else if (value === null && statIndex > -1) {
        team.statConstraints.splice(statIndex, 1)
      } else if (value !== null && statIndex > -1) {
        team.statConstraints[statIndex].values[frameIndex] = value
        team.statConstraints[statIndex].isMaxs[frameIndex] = isMax
      }
    })
  }
}
