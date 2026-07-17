import {
  zodEnum,
  zodString,
  zodTypedRecord,
} from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  allCharacterKeys,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { IGO, ImportResult } from '../exim'
import { defaultInitialWeaponKey, initialWeapon } from './WeaponDataManager'

const artifactIdsSchema = zodTypedRecord(
  allArtifactSlotKeys,
  z.union([z.string(), z.undefined()])
)

const buildSchema = z.object({
  name: z.string().catch('Build Name'),
  description: zodString(),
  id: z.string().catch(''),
  characterKey: zodEnum(allCharacterKeys),
  weaponId: z.string().optional(),
  artifactIds: artifactIdsSchema.catch(
    objKeyMap(allArtifactSlotKeys, () => undefined)
  ),
})
export type Build = z.infer<typeof buildSchema>

export class BuildDataManager extends DataManager<
  string,
  'builds',
  Build,
  Build,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'builds')
    for (const key of this.database.storage.keys)
      if (key.startsWith('build_') && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: unknown): Build | undefined {
    const result = buildSchema.safeParse(obj)
    if (!result.success) return undefined

    const { name, description, id, artifactIds, characterKey } = result.data
    let { weaponId } = result.data

    if (weaponId && !this.database.weapons.get(weaponId)) weaponId = undefined

    // force the build to have a valid weapon
    if (!weaponId) {
      const weaponTypeKey = getCharStat(characterKey).weaponType
      const defWeaponKey = defaultInitialWeaponKey(weaponTypeKey)
      weaponId = this.database.weapons.keys.find((wId) => {
        const { key, location } = this.database.weapons.get(wId)!
        return !location && key === defWeaponKey
      })
      if (!weaponId)
        weaponId = this.database.weapons.new(initialWeapon(defWeaponKey))
    }

    const validatedArtifactIds = objKeyMap(
      allArtifactSlotKeys,
      (sk): string | undefined => {
        const artId = artifactIds[sk]
        if (!artId) return undefined
        const art = this.database.arts.get(artId)
        if (!art || art.slotKey !== sk) return undefined
        return artId
      }
    )

    return {
      name,
      description,
      id,
      characterKey,
      weaponId,
      artifactIds: validatedArtifactIds,
    }
  }

  forCharacter(characterKey: CharacterKey): Build[] {
    return this.values.filter((b) => b.characterKey === characterKey)
  }
  entriesForCharacter(characterKey: CharacterKey): [string, Build][] {
    return this.entries.filter(([, b]) => b.characterKey === characterKey)
  }

  new(build: Partial<Build> & Pick<Build, 'characterKey'>): string {
    const id = this.generateKey()
    if (!this.set(id, build)) return ''
    return id
  }
  duplicate(buildId: string): string {
    const build = this.get(buildId)
    if (!build) return ''
    return this.new(structuredClone(build))
  }
  override remove(key: string, notify?: boolean): Build | undefined {
    const build = super.remove(key, notify)
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutData?.some(
          (loadoutDatum) =>
            loadoutDatum?.buildId === key ||
            loadoutDatum?.compareBuildId === key
        ) && this.database.teams.set(teamId, {}) // trigger a validation
    )

    return build
  }
  override importGOOD(good: IGOOD & IGO, result: ImportResult): void {
    result.builds.beforeImport = this.entries.length

    const builds = good[this.dataKey]
    if (builds && Array.isArray(builds)) {
      result.builds.import = builds.length
    }

    super.importGOOD(good, result)
  }
}
