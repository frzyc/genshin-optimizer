import {
  deepClone,
  objKeyMap,
  objMap,
  range,
} from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  allElementWithPhyKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import type { ICachedArtifact, ICachedWeapon } from '../../Interfaces'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import { defaultInitialWeapon } from './WeaponDataManager'

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

  enemyOverride: Partial<
    Record<
      EleEnemyResKey | 'enemyLevel' | 'enemyDefRed_' | 'enemyDefIgn_',
      number
    >
  >
  conditional: {
    resonance: { [key: string]: string }
  }
  loadoutData: Array<LoadoutDatum | undefined>
  lastEdit: number
}
export type LoadoutExportSetting = {
  convertEquipped: boolean
  convertbuilds: string[]
  convertTcBuilds: string[]
  exportCustomMultiTarget: number[]
}
export const defLoadoutExportSetting = (): LoadoutExportSetting => ({
  convertEquipped: false,
  convertbuilds: [],
  convertTcBuilds: [],
  exportCustomMultiTarget: [],
})
export type LoadoutDataExportSetting = Array<LoadoutExportSetting>
export class TeamDataManager extends DataManager<
  string,
  'teams',
  Team,
  Team,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'teams')
    for (const key of this.database.storage.keys)
      if (key.startsWith('team_') && !this.set(key, {}))
        this.database.storage.remove(key)
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
      enemyOverride,
      conditional,
      loadoutData,
      lastEdit,
    } = obj as Team
    if (typeof name !== 'string') name = this.newName()
    if (typeof description !== 'string') description = ''

    {
      // validate enemyOverride
      if (typeof enemyOverride !== 'object') enemyOverride = {}

      if (typeof enemyOverride.enemyLevel !== 'number')
        enemyOverride.enemyLevel = 100

      if (typeof enemyOverride.enemyDefRed_ !== 'number')
        enemyOverride.enemyDefRed_ = 0

      if (typeof enemyOverride.enemyDefIgn_ !== 'number')
        enemyOverride.enemyDefIgn_ = 0

      allElementWithPhyKeys.map((ele) => {
        const key = `${ele}_enemyRes_` as EleEnemyResKey
        if (typeof enemyOverride[key] !== 'number') enemyOverride[key] = 10
      })
    }

    if (!conditional) conditional = { resonance: {} }

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
          !teamChar.buildIds.includes(compareBuildId) ||
          !this.database.builds.get(compareBuildId)?.weaponId
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
      enemyOverride,
      conditional,
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
  export(
    teamId: string,
    loadoutDataExportSetting: LoadoutDataExportSetting
  ): object {
    const team = this.database.teams.get(teamId)
    if (!team) return {}
    const { loadoutData, ...rest } = team
    return {
      ...rest,
      loadoutData: loadoutData.map(
        (loadoutData, i) =>
          loadoutData?.teamCharId &&
          this.database.teamChars.export(
            loadoutData?.teamCharId,
            loadoutDataExportSetting[i]
          )
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

  /**
   *
   * @param teamCharId
   * @returns a ICached weapon, because in WR a lack of a weapon can have strange effects
   */
  getLoadoutWeapon({
    buildType,
    buildId,
    buildTcId,
    teamCharId,
  }: LoadoutDatum): ICachedWeapon {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return defaultInitialWeapon()
    const { key: characterKey } = teamChar
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return defaultInitialWeapon()
        return (
          this.database.weapons.get(char.equippedWeapon) ??
          defaultInitialWeapon()
        )
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return defaultInitialWeapon()
        return (
          this.database.weapons.get(build.weaponId) ?? defaultInitialWeapon()
        )
      }
      case 'tc': {
        const buildTc = this.database.buildTcs.get(buildTcId)
        if (!buildTc) return defaultInitialWeapon()
        return {
          ...buildTc.weapon,
          location: charKeyToLocCharKey(teamChar.key),
          lock: false,
          id: 'invalid',
        }
      }
    }
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
   * Note: this doesnt return any artifacts(all undefined) when the current teamchar is using a TC Build.
   */
  getLoadoutArtifacts({
    teamCharId,
    buildType,
    buildId,
  }: LoadoutDatum): Record<ArtifactSlotKey, ICachedArtifact | undefined> {
    const teamChar = this.database.teamChars.get(teamCharId)
    if (!teamChar) return objKeyMap(allArtifactSlotKeys, () => undefined)
    const { key: characterKey } = teamChar
    switch (buildType) {
      case 'equipped': {
        const char = this.database.chars.get(characterKey)
        if (!char) return objKeyMap(allArtifactSlotKeys, () => undefined)
        return objMap(char.equippedArtifacts, (id) =>
          this.database.arts.get(id)
        )
      }
      case 'real': {
        const build = this.database.builds.get(buildId)
        if (!build) return objKeyMap(allArtifactSlotKeys, () => undefined)
        return objMap(build.artifactIds, (id) => this.database.arts.get(id))
      }
    }
    return objKeyMap(allArtifactSlotKeys, () => undefined)
  }

  followLoadoutDatum(
    { buildType, buildId, buildTcId }: LoadoutDatum,
    callback: () => void
  ) {
    if (buildType === 'real') {
      const build = this.database.builds.get(buildId)
      if (!build) return () => {}
      const unfollowBuild = this.database.builds.follow(buildId, callback)
      const unfollowWeapon = build.weaponId
        ? this.database.weapons.follow(build.weaponId, callback)
        : () => {}
      const unfollowArts = Object.values(build.artifactIds).map((id) =>
        id ? this.database.arts.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowWeapon()
        unfollowArts.forEach((unfollow) => unfollow())
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
      const unfollowWeapon = build.weaponId
        ? this.database.weapons.follow(build.weaponId, callback)
        : () => {}
      const unfollowArts = Object.values(build.artifactIds).map((id) =>
        id ? this.database.arts.follow(id, callback) : () => {}
      )
      return () => {
        unfollowBuild()
        unfollowWeapon()
        unfollowArts.forEach((unfollow) => unfollow())
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
