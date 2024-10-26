import {
  objKeyMap,
  objMap,
  pruneOrPadArray,
  range,
  shallowCompareObj,
} from '@genshin-optimizer/common/util'
import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'
import type { Member, Sheet, Tag } from '@genshin-optimizer/sr/formula'
import type { ICachedRelic } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import { validateTag } from '../tagUtil'

const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type BuildTypeKey = (typeof buildTypeKeys)[number]
export type TeamMetadatum = {
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
export interface Team {
  name: string
  description: string

  lastEdit: number

  // frames, store data as a "sparse 2d array"
  frames: Array<Tag>
  conditionals: Array<{
    sheet: Sheet
    src: Member | 'all'
    dst: Member | 'all'
    condKey: string
    condValues: number[] // should be the same length as `frames`
  }>
  bonusStats: Array<{
    tag: Tag
    values: number[] // should be the same length as `frames`
  }>
  statConstraints: Array<{ tag: Tag; values: number[]; isMaxs: boolean[] }>

  // TODO enemy base stats
  teamMetadata: Array<TeamMetadatum | undefined>
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
      conditionals: conditional,
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
        const teamMetadatum = teamMetadata[ind]
        if (!teamMetadatum || typeof teamMetadatum !== 'object')
          return undefined
        const { characterKey } = teamMetadatum
        let {
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
          optConfigId,
        } = teamMetadatum

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
        } as TeamMetadatum
      })
    }

    if (typeof lastEdit !== 'number') lastEdit = Date.now()

    if (!Array.isArray(frames)) frames = []
    frames = frames.filter(validateTag)
    const framesLength = frames.length
    if (!framesLength) {
      conditional = []
      bonusStats = []
    } else {
      if (!Array.isArray(conditional)) conditional = []
      if (!Array.isArray(bonusStats)) bonusStats = []
      if (!Array.isArray(statConstraints)) statConstraints = []
      conditional = conditional.filter(({ condValues }) => {
        // TODO: validate conditionals src dst condKey
        if (!Array.isArray(condValues)) return false
        pruneOrPadArray(condValues, framesLength, 0)
        // If all values are false, remove the conditional
        if (condValues.every((v) => !v)) return false
        return true
      })
      bonusStats = bonusStats.filter(({ tag, values }) => {
        if (!validateTag(tag)) return false
        if (!Array.isArray(values)) return false
        pruneOrPadArray(values, framesLength, 0)
        return true
      })

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
      conditionals: conditional,
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
    rem.teamMetadata.forEach((teamMetadatum) => {
      teamMetadatum?.optConfigId &&
        this.database.optConfigs.remove(teamMetadatum?.optConfigId)
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
   * Note: this doesnt return any relics (all undefined) when the current teamchar is using a TC Build.
   */
  getTeamRelics({
    characterKey,
    buildType,
    buildId,
  }: TeamMetadatum): Record<RelicSlotKey, ICachedRelic | undefined> {
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return objKeyMap(allRelicSlotKeys, () => undefined)
        return objMap(char.equippedRelics, (id) => this.database.relics.get(id))
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return objKeyMap(allRelicSlotKeys, () => undefined)
        return objMap(build.relicIds, (id) => this.database.relics.get(id))
      }
    }
    return objKeyMap(allRelicSlotKeys, () => undefined)
  }

  followTeamDatum(
    { buildType, buildId, buildTcId }: TeamMetadatum,
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
    { compareType, compareBuildId, compareBuildTcId }: TeamMetadatum,
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
  getActiveBuildName(
    { buildType, buildId, buildTcId }: TeamMetadatum,
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

  setConditional(
    teamId: string,
    sheet: Sheet,
    src: Member | 'all',
    dst: Member | 'all',
    condKey: string,
    condValue: number,
    frameIndex: number
  ) {
    this.set(teamId, (team) => {
      const condIndex = team.conditionals.findIndex(
        (c) => c.src === src && c.dst === dst && c.condKey === condKey
      )
      if (frameIndex > team.frames.length) return
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
        team.conditionals[condIndex].condValues[frameIndex] = condValue
      }
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
