import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
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
    return validateBuild(obj, this.database)
  }

  new(build: Partial<Build> = {}): string {
    const id = this.generateKey()
    this.set(id, build)
    return id
  }
  override clear(): void {
    super.clear()
  }
}

function validateBuild(
  obj: unknown = {},
  database: ArtCharDatabase
): Build | undefined {
  let { name, description, weaponId, artifactIds } = obj as Build
  if (typeof name !== 'string') name = 'Build Name'
  if (typeof description !== 'string') description = 'Build Description'
  if (weaponId && !database.weapons.get(weaponId)) weaponId = undefined
  if (typeof artifactIds !== 'object')
    artifactIds = objKeyMap(allArtifactSlotKeys, () => undefined)
  else
    artifactIds = objKeyMap(allArtifactSlotKeys, (sk) => {
      const id = artifactIds[sk]
      if (!id) return undefined
      const art = database.arts.get(id)
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
