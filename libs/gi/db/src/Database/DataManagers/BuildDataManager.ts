import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { IGO, ImportResult } from '../exim'
import { defaultInitialWeaponKey, initialWeapon } from './WeaponDataManager'
export interface Build {
  name: string
  description: string
  id: string

  weaponId?: string
  artifactIds: Record<ArtifactSlotKey, string | undefined>
}

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
    let { name, description, weaponId, artifactIds } = obj as Build
    const { id } = obj as Build
    if (typeof name !== 'string') name = 'Build Name'
    if (typeof description !== 'string') description = ''
    if (weaponId && !this.database.weapons.get(weaponId)) weaponId = undefined

    // force the build to have a valid weapon
    if (!weaponId) {
      // something is broken, so we get a dullblade as default
      const defWeaponKey = defaultInitialWeaponKey('sword')

      weaponId = this.database.weapons.keys.find((weaponId) => {
        const { key, location } = this.database.weapons.get(weaponId)!
        return !location && key === defWeaponKey
      })
      if (!weaponId)
        weaponId = this.database.weapons.new(initialWeapon(defWeaponKey))
    }

    if (typeof artifactIds !== 'object')
      artifactIds = objKeyMap(allArtifactSlotKeys, () => undefined)
    else
      artifactIds = objKeyMap(allArtifactSlotKeys, (sk) => {
        const id = artifactIds[sk]
        if (!id) return undefined
        const art = this.database.arts.get(id)
        if (!art) return undefined
        if (art.slotKey !== sk) return undefined
        return id
      })
    return {
      name,
      description,
      weaponId,
      artifactIds,
      id,
    }
  }

  new(build: Partial<Build> = {}): string {
    const id = this.generateKey()
    this.set(id, build)
    return id
  }
  duplicate(buildId: string): string {
    const build = this.get(buildId)
    if (!build) return ''
    return this.new(structuredClone(build))
  }
  override remove(key: string, notify?: boolean): Build | undefined {
    const build = super.remove(key, notify)
    // remove data from teamChar first
    this.database.teamChars.entries.forEach(
      ([teamCharId, teamChar]) =>
        teamChar.buildIds.includes(key) &&
        this.database.teamChars.set(teamCharId, {})
    )
    // once teamChars are validated, teams can be validated as well
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutData?.some(
          (loadoutDatum) =>
            loadoutDatum?.buildId === key || loadoutDatum?.compareBuildId
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
