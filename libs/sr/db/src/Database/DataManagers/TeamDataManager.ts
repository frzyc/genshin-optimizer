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
export type LoadoutMetadatum = {
  loadoutId: string
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

  loadoutMetadata: Array<LoadoutMetadatum | undefined>
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
    let { name, description, loadoutMetadata, lastEdit } = obj as Team
    if (typeof name !== 'string') name = this.newName()
    if (typeof description !== 'string') description = ''

    {
      // validate loadoutIds
      if (!Array.isArray(loadoutMetadata))
        loadoutMetadata = range(0, 3).map(() => undefined)

      loadoutMetadata = range(0, 3).map((ind) => {
        const loadoutMetadatum = loadoutMetadata[ind]
        if (!loadoutMetadatum || typeof loadoutMetadatum !== 'object')
          return undefined
        const { loadoutId } = loadoutMetadatum
        let {
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
        } = loadoutMetadatum
        const loadout = this.database.loadouts.get(loadoutId)
        if (!loadout) return undefined

        if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'
        if (typeof buildId !== 'string' || !loadout.buildIds.includes(buildId))
          buildId = ''

        if (
          typeof buildTcId !== 'string' ||
          !loadout.buildTcIds.includes(buildTcId)
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
          !loadout.buildIds.includes(compareBuildId)
        ) {
          compareBuildId = ''
          if (compareType === 'real') compareType = 'equipped'
        }

        if (
          typeof compareBuildTcId !== 'string' ||
          !loadout.buildTcIds.includes(compareBuildTcId)
        ) {
          compareBuildTcId = ''
          if (compareType === 'tc') compareType = 'equipped'
        }

        return {
          loadoutId,
          buildType,
          buildId,
          buildTcId,
          compare,
          compareType,
          compareBuildId,
          compareBuildTcId,
        } as LoadoutMetadatum
      })

      // make sure there isnt a team without "Active" character, by shifting characters forward.
      if (
        !loadoutMetadata[0] &&
        loadoutMetadata.some((loadoutMetadata) => loadoutMetadata)
      ) {
        const index = loadoutMetadata.findIndex(
          (loadoutMetadata) => !!loadoutMetadata
        )
        loadoutMetadata[0] = loadoutMetadata[index]
        loadoutMetadata[index] = undefined
      }
    }

    if (typeof lastEdit !== 'number') lastEdit = Date.now()

    return {
      name,
      description,
      loadoutMetadata,
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
    const { loadoutMetadata, ...rest } = team
    return {
      ...rest,
      loadoutMetadata: loadoutMetadata.map(
        (loadoutMetadatum) =>
          loadoutMetadatum?.loadoutId &&
          this.database.loadouts.export(loadoutMetadatum?.loadoutId)
      ),
    }
  }
  import(data: object): string {
    const { loadoutMetadata, ...rest } = data as Team & {
      loadoutMetadata: object[]
    }
    const id = this.generateKey()
    if (
      !this.set(id, {
        ...rest,
        name: `${rest.name ?? ''} (Imported)`,
        loadoutMetadata: loadoutMetadata.map(
          (obj) =>
            obj && {
              loadoutId: this.database.loadouts.import(obj),
            }
        ),
      } as Team)
    )
      return ''
    return id
  }

  getActiveTeamChar(teamId: string) {
    const team = this.database.teams.get(teamId)
    const loadoutId = team?.loadoutMetadata[0]?.loadoutId
    return this.database.loadouts.get(loadoutId)
  }

  getLoadoutDatum(teamId: string, loadoutId: string) {
    const team = this.get(teamId)
    if (!team) return undefined
    return team.loadoutMetadata.find(
      (loadoutMetadatum) => loadoutMetadatum?.loadoutId === loadoutId
    )
  }
  setLoadoutDatum(
    teamId: string,
    loadoutId: string,
    data: Partial<LoadoutMetadatum>
  ) {
    this.set(teamId, (team) => {
      const loadoutDataInd = team.loadoutMetadata.findIndex(
        (loadoutMetadatum) =>
          loadoutMetadatum && loadoutMetadatum.loadoutId === loadoutId
      )
      if (loadoutDataInd < 0) return

      team.loadoutMetadata[loadoutDataInd]! = {
        ...team.loadoutMetadata[loadoutDataInd]!,
        ...data,
      }
    })
  }
  /**
   * Note: this doesnt return any relics (all undefined) when the current teamchar is using a TC Build.
   */
  getLoadoutRelics({
    loadoutId,
    buildType,
    buildId,
  }: LoadoutMetadatum): Record<RelicSlotKey, ICachedRelic | undefined> {
    const loadout = this.database.loadouts.get(loadoutId)
    if (!loadout) return objKeyMap(allRelicSlotKeys, () => undefined)
    const { key: characterKey } = loadout
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
    { buildType, buildId, buildTcId }: LoadoutMetadatum,
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
    { compareType, compareBuildId, compareBuildTcId }: LoadoutMetadatum,
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
    { buildType, buildId, buildTcId }: LoadoutMetadatum,
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
