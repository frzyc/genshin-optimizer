import {
  deepClone,
  objKeyMap,
  objMap,
  range,
} from '@genshin-optimizer/common/util'
import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import type { ICachedRelic } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type BuildTypeKey = (typeof buildTypeKeys)[number]
export type LoadoutDatum = {
  teamCharId: string
  buildType: BuildTypeKey
  buildId: string
  buildTcId: string
  compare: boolean
  compareType: BuildTypeKey
  compareBuildId: string
  compareBuildTcId: string
}
export interface Team {
  name: string
  description: string

  loadoutData: Array<LoadoutDatum | undefined>
  lastEdit: number
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
    let { name, description, loadoutData, lastEdit } = obj as Team
    if (typeof name !== 'string') name = this.newName()
    if (typeof description !== 'string') description = ''

    {
      // validate teamCharIds
      if (!Array.isArray(loadoutData))
        loadoutData = range(0, 3).map(() => undefined)

      loadoutData = range(0, 3).map((ind) => {
        const loadoutDatum = loadoutData[ind]
        if (!loadoutDatum || typeof loadoutDatum !== 'object') return undefined
        const { teamCharId } = loadoutDatum
        let {
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
        } = loadoutDatum
        const teamChar = this.database.teamChars.get(teamCharId)
        if (!teamChar) return undefined

        if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'
        if (typeof buildId !== 'string' || !teamChar.buildIds.includes(buildId))
          buildId = ''

        if (
          typeof buildTcId !== 'string' ||
          !teamChar.buildTcIds.includes(buildTcId)
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
          !teamChar.buildIds.includes(compareBuildId)
        ) {
          compareBuildId = ''
          if (compareType === 'real') compareType = 'equipped'
        }

        if (
          typeof compareBuildTcId !== 'string' ||
          !teamChar.buildTcIds.includes(compareBuildTcId)
        ) {
          compareBuildTcId = ''
          if (compareType === 'tc') compareType = 'equipped'
        }

        return {
          teamCharId,
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
        } as LoadoutDatum
      })

      // make sure there isnt a team without "Active" character, by shifting characters forward.
      if (!loadoutData[0] && loadoutData.some((loadoutData) => loadoutData)) {
        const index = loadoutData.findIndex((loadoutData) => !!loadoutData)
        loadoutData[0] = loadoutData[index]
        loadoutData[index] = undefined
      }
    }

    if (typeof lastEdit !== 'number') lastEdit = Date.now()

    return {
      name,
      description,
      loadoutData,
      lastEdit,
    }
  }

  new(value: Partial<Team> = {}): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override clear(): void {
    super.clear()
  }

  duplicate(teamId: string): string {
    const teamRaw = this.database.teams.get(teamId)
    if (!teamRaw) return ''
    const team = deepClone(teamRaw)
    team.name = `${team.name} (duplicated)`
    return this.new(team)
  }
  export(teamId: string): object {
    const team = this.database.teams.get(teamId)
    if (!team) return {}
    const { loadoutData, ...rest } = team
    return {
      ...rest,
      loadoutData: loadoutData.map(
        (loadoutData) =>
          loadoutData?.teamCharId &&
          this.database.teamChars.export(loadoutData?.teamCharId)
      ),
    }
  }
  import(data: object): string {
    const { loadoutData, ...rest } = data as Team & { loadoutData: object[] }
    const id = this.generateKey()
    if (
      !this.set(id, {
        ...rest,
        name: `${rest.name ?? ''} (Imported)`,
        loadoutData: loadoutData.map(
          (obj) =>
            obj && {
              teamCharId: this.database.teamChars.import(obj),
            }
        ),
      } as Team)
    )
      return ''
    return id
  }

  getActiveTeamChar(teamId: string) {
    const team = this.database.teams.get(teamId)
    const teamCharId = team?.loadoutData[0]?.teamCharId
    return this.database.teamChars.get(teamCharId)
  }

  getLoadoutDatum(teamId: string, teamCharId: string) {
    const team = this.get(teamId)
    if (!team) return undefined
    return team.loadoutData.find(
      (loadoutDatum) => loadoutDatum?.teamCharId === teamCharId
    )
  }
  setLoadoutDatum(
    teamId: string,
    teamCharId: string,
    data: Partial<LoadoutDatum>
  ) {
    this.set(teamId, (team) => {
      const loadoutDataInd = team.loadoutData.findIndex(
        (loadoutDatum) => loadoutDatum && loadoutDatum.teamCharId === teamCharId
      )
      if (loadoutDataInd < 0) return

      team.loadoutData[loadoutDataInd]! = {
        ...team.loadoutData[loadoutDataInd]!,
        ...data,
      }
    })
  }
  /**
   * Note: this doesnt return any relics (all undefined) when the current teamchar is using a TC Build.
   */
  getLoadoutRelics({
    teamCharId,
    buildType,
    buildId,
  }: LoadoutDatum): Record<RelicSlotKey, ICachedRelic | undefined> {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return objKeyMap(allRelicSlotKeys, () => undefined)
    const { key: characterKey } = teamChar
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

  followLoadoutDatum(
    { buildType, buildId, buildTcId }: LoadoutDatum,
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
  followLoadoutDatumCompare(
    { compareType, compareBuildId, compareBuildTcId }: LoadoutDatum,
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
    { buildType, buildId, buildTcId }: LoadoutDatum,
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
}
