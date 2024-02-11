import { objKeyMap, objMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  allCharacterKeys,
  allInfusionAuraElementKeys,
  type AdditiveReactionKey,
  type AmpReactionKey,
  type CharacterKey,
  type InfusionAuraElementKey,
  type MultiOptHitModeKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '../../Interfaces'
import type { InputPremodKey } from '../../legacy/keys'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { ICachedArtifact } from './ArtifactDataManager'
import type { Build } from './BuildDataManager'
import { validateCustomMultiTarget } from './CustomMultiTarget'
import { defaultInitialWeapon } from './WeaponDataManager'
const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type buildTypeKey = (typeof buildTypeKeys)[number]
type CondKey = CharacterKey | ArtifactSetKey | WeaponKey
export type IConditionalValues = Partial<
  Record<CondKey, { [key: string]: string }>
>
export interface TeamCharacter {
  key: CharacterKey

  customMultiTargets: CustomMultiTarget[]
  conditional: IConditionalValues

  bonusStats: Partial<Record<InputPremodKey, number>>
  infusionAura?: InfusionAuraElementKey | ''
  // TODO builds
  buildType: buildTypeKey
  buildId: string
  buildIds: string[]
  buildTcId: string
  buildTcIds: string[]
}

export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: Partial<Record<InputPremodKey, number>>
}
export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
}

export class TeamCharacterDataManager extends DataManager<
  string,
  'teamchars',
  TeamCharacter,
  TeamCharacter,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'teamchars')
    for (const key of this.database.storage.keys)
      if (key.startsWith('teamchar_') && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: unknown): TeamCharacter | undefined {
    return validateTeamCharater(obj, this.database)
  }

  new(key: CharacterKey): string {
    const id = this.generateKey()
    this.set(id, { key })
    return id
  }
  override clear(): void {
    super.clear()
  }
  newBuild(teamcharId: string, build: Partial<Build> = {}) {
    if (!this.get(teamcharId)) return
    const id = this.database.builds.new(build)
    if (!id) return
    this.set(teamcharId, (teamChar) => {
      teamChar.buildIds.unshift(id)
    })
  }
  /**
   *
   * @param teamCharId
   * @returns a ICached weapon, because in WR a lack of a weapon can have strange effects
   */
  getLoadoutWeapon(teamCharId: string): ICachedWeapon {
    const teamChar = this.get(teamCharId)
    if (!teamChar) return defaultInitialWeapon()
    const { key: characterKey, buildType, buildId, buildTcId } = teamChar
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
      //TODO case 'TC'
    }
    return defaultInitialWeapon()
  }

  getLoadoutArtifacts(
    teamCharId: string
  ): Record<ArtifactSlotKey, ICachedArtifact | undefined> {
    const teamChar = this.get(teamCharId)
    if (!teamChar) return objKeyMap(allArtifactSlotKeys, () => undefined)
    const { key: characterKey, buildType, buildId, buildTcId } = teamChar
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
      //TODO case 'TC'
    }
    return objKeyMap(allArtifactSlotKeys, () => undefined)
  }
}

function validateTeamCharater(
  obj: unknown = {},
  database: ArtCharDatabase
): TeamCharacter | undefined {
  const { key: characterKey } = obj as TeamCharacter
  let {
    customMultiTargets,
    conditional,
    bonusStats,
    infusionAura,

    buildType,
    buildId,
    buildIds,
    buildTcId,
    buildTcIds,
  } = obj as TeamCharacter
  if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

  if (!customMultiTargets) customMultiTargets = []
  customMultiTargets = customMultiTargets
    .map((cmt) => validateCustomMultiTarget(cmt))
    .filter((t) => t) as CustomMultiTarget[]

  if (!conditional) conditional = {}

  // TODO: validate bonusStats
  if (
    typeof bonusStats !== 'object' ||
    !Object.entries(bonusStats).map(([_, num]) => typeof num === 'number')
  )
    bonusStats = {}

  if (
    infusionAura &&
    !allInfusionAuraElementKeys.includes(infusionAura as InfusionAuraElementKey)
  )
    infusionAura = undefined

  if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'

  if (typeof buildId !== 'string') buildId = ''
  if (!Array.isArray(buildIds)) buildIds = []
  buildIds = buildIds.filter((buildId) =>
    database.builds.keys.includes(buildId)
  )
  if (typeof buildTcId !== 'string') buildTcId = ''
  if (!Array.isArray(buildTcIds)) buildTcIds = []
  // TODO: validate against valid buildTcIds
  if (!buildId && !buildTcId) buildType = 'equipped'

  return {
    key: characterKey,
    customMultiTargets,
    conditional,
    bonusStats,
    infusionAura,
    buildType,
    buildId,
    buildIds,
    buildTcId,
    buildTcIds,
  }
}
