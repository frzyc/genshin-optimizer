import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import { defaultInitialWeaponKey, initialWeapon } from './WeaponDataManager'
export interface Build {
  name: string
  description: string

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
    if (typeof name !== 'string') name = 'Build Name'
    if (typeof description !== 'string') description = 'Build Description'
    if (weaponId && !this.database.weapons.get(weaponId)) weaponId = undefined

    // force the loadout to have a valid weapon
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
}
