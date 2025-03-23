import {
  notEmpty,
  objKeyMap,
  pruneOrPadArray,
  range,
  shallowCompareObj,
} from '@genshin-optimizer/common/util'
import { correctConditionalValue } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
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
import type { RelicIds } from '../../Types'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import { validateTag } from '../tagUtil'

const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type BuildTypeKey = (typeof buildTypeKeys)[number]
export type TeammateDatum = {
  characterKey: CharacterKey

  buildType: BuildTypeKey
  buildId: string
  buildTcId: string
  compare: boolean
  compareType: BuildTypeKey
  compareBuildId: string
  compareBuildTcId: string

  optConfigId?: string
}
export type Frame = {
  tag: Tag
  multiplier: number
  description?: string
}
export interface Team {
  name: string
  description: string

  lastEdit: number

  // frames, store data as a "sparse 2d array"
  frames: Array<Frame>
  conditionals: Array<{
    sheet: Sheet
    src: Src
    dst: Dst
    condKey: string
    condValues: number[] // should be the same length as `frames`
  }>
  bonusStats: Array<{
    tag: Tag
    values: number[] // should be the same length as `frames`
  }>
  statConstraints: Array<{
    tag: Tag
    values: number[] // should be the same length as `frames`
    isMaxs: boolean[] // should be the same length as `frames`
  }>

  // TODO enemy base stats
  teamMetadata: Array<TeammateDatum | undefined>
}

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
    let {
      name,
      description,
      teamMetadata,
      lastEdit,
      frames,
      conditionals,
      bonusStats,
      statConstraints,
    } = obj as Team
    if (typeof name !== 'string') name = this.newName()
    if (typeof description !== 'string') description = ''

    // Validate teamMetadata
    {
      // validate loadoutIds
      if (!Array.isArray(teamMetadata))
        teamMetadata = range(0, 3).map(() => undefined)

      teamMetadata = range(0, 3).map((ind) => {
        const teammateDatum = teamMetadata[ind]
        if (!teammateDatum || typeof teammateDatum !== 'object')
          return undefined
        const { characterKey } = teammateDatum
        let {
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
          optConfigId,
        } = teammateDatum

        if (!allCharacterKeys.includes(characterKey)) return undefined
        if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'
        if (
          typeof buildId !== 'string' ||
          !this.database.builds.keys.includes(buildId)
        )
          buildId = ''

        if (
          typeof buildTcId !== 'string' ||
          !this.database.buildTcs.keys.includes(buildTcId)
        )
          buildTcId = ''

        if (
          (!buildId && !buildTcId) ||
          (buildType === 'real' && !buildId) ||
          (buildType === 'tc' && !buildTcId)
        )
          buildType = 'equipped'

        if (typeof compare !== 'boolean') compare = false
        if (!buildTypeKeys.includes(compareType)) compareType = 'equipped'

        if (
          typeof compareBuildId !== 'string' ||
          !this.database.builds.keys.includes(compareBuildId)
        ) {
          compareBuildId = ''
          if (compareType === 'real') compareType = 'equipped'
        }

        if (
          typeof compareBuildTcId !== 'string' ||
          !this.database.buildTcs.keys.includes(compareBuildTcId)
        ) {
          compareBuildTcId = ''
          if (compareType === 'tc') compareType = 'equipped'
        }

        if (optConfigId && !this.database.optConfigs.keys.includes(optConfigId))
          optConfigId = undefined

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
    }

    if (typeof lastEdit !== 'number') lastEdit = Date.now()

    if (!Array.isArray(frames)) frames = []
    frames = frames
      .map((f) => {
        const { tag } = f
        let { multiplier, description } = f
        if (!validateTag(tag)) return undefined
        if (typeof multiplier !== 'number' || multiplier === 0) multiplier = 1
        if (typeof description !== 'string') description = undefined

        return { tag, multiplier, description }
      })
      .filter(notEmpty)
    const framesLength = frames.length
    if (!framesLength) {
      conditionals = []
      bonusStats = []
    } else {
      if (!Array.isArray(conditionals)) conditionals = []
      const hashList: string[] = [] // a hash to ensure sheet:condKey:src:dst is unique
      conditionals = conditionals.filter(
        ({ sheet, condKey, src, dst, condValues }) => {
          if (!isMember(src) || !(dst === null || isMember(dst))) return false
          const cond = getConditional(sheet, condKey)
          if (!cond) return false

          // validate uniqueness
          const hash = `${sheet}:${condKey}:${src}:${dst}`
          if (hashList.includes(hash)) return false
          hashList.push(hash)

          // validate values
          if (!Array.isArray(condValues)) return false
          pruneOrPadArray(condValues, framesLength, 0)
          condValues = condValues.map((v) => correctConditionalValue(cond, v))
          // If all values are false, remove the conditional
          if (condValues.every((v) => !v)) return false

          return true
        }
      )

      if (!Array.isArray(bonusStats)) bonusStats = []
      bonusStats = bonusStats.filter(({ tag, values }) => {
        if (!validateTag(tag)) return false
        if (!Array.isArray(values)) return false
        pruneOrPadArray(values, framesLength, 0)
        return true
      })

      if (!Array.isArray(statConstraints)) statConstraints = []
      statConstraints = statConstraints.filter(({ tag, values, isMaxs }) => {
        if (!validateTag(tag)) return false
        if (!Array.isArray(values)) return false
        pruneOrPadArray(values, framesLength, 0)
        if (!Array.isArray(isMaxs)) return false
        pruneOrPadArray(isMaxs, framesLength, false)
        return true
      })
    }
    // TODO: validate frames

    // TODO: validate bonusStats

    return {
      name,
      description,
      teamMetadata: teamMetadata,
      lastEdit,
      frames,
      conditionals,
      bonusStats,
      statConstraints,
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

  //TODO: dup + i/o
  // duplicate(teamId: string): string {
  //   const teamRaw = this.database.teams.get(teamId)
  //   if (!teamRaw) return ''
  //   const team = deepClone(teamRaw)
  //   team.name = `${team.name} (duplicated)`
  //   return this.new(team)
  // }
  // export(teamId: string): object {
  //   const team = this.database.teams.get(teamId)
  //   if (!team) return {}
  //   const { loadoutMetadata, ...rest } = team
  //   return {
  //     ...rest,
  //     loadoutMetadata: loadoutMetadata.map(
  //       (loadoutMetadatum) =>
  //         loadoutMetadatum?.loadoutId &&
  //         this.database.loadouts.export(loadoutMetadatum?.loadoutId)
  //     ),
  //   }
  // }
  // import(data: object): string {
  //   const { teamMetadata: loadoutMetadata, ...rest } = data as Team & {
  //     loadoutMetadata: object[]
  //   }
  //   const id = this.generateKey()
  //   if (
  //     !this.set(id, {
  //       ...rest,
  //       name: `${rest.name ?? ''} (Imported)`,
  //       teamMetadata: loadoutMetadata.map(
  //         (obj) =>
  //           obj && {
  //             loadoutId: this.database.loadouts.import(obj),
  //           }
  //       ),
  //     } as Team)
  //   )
  //     return ''
  //   return id
  // }

  /**
   * Note: this doesnt return any ids (all undefined) when the current teamchar is using a TC Build.
   */
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
        // Check if the value is the same, return false to not propagate the update.
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
  /**
   *
   * @param teamId
   * @param tag
   * @param value number or null, null to delete
   * @param frameIndex
   */
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
  /**
   *
   * @param teamId
   * @param tag
   * @param value number or null, null to delete
   * @param isMax
   * @param frameIndex
   */
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
