// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateSr` function
// 2. Add new `migrateVersion` call within `migrateStorage` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

import type { DBStorage } from '@genshin-optimizer/common/database'
import type { ICharacter, IWengine } from '@genshin-optimizer/zzz/zood'
import type {
  ICharMeta,
  IZZZDatabase,
  IZenlessObjectDescription,
} from '../Interfaces'
import type { CharOpt } from './DataManagers'

export const currentDBVersion = 2

export function migrateZOD(
  zo: IZenlessObjectDescription & IZZZDatabase
): IZenlessObjectDescription & IZZZDatabase {
  const version = zo.dbVersion ?? 0
  function migrateVersion(version: number, cb: () => void) {
    const dbver = zo.dbVersion ?? 0
    if (dbver < version) {
      cb()
      // Update version upon each successful migration, so we don't
      // need to migrate that part again if later parts fail.
      zo.dbVersion = version
    }
  }

  migrateVersion(2, () => {
    const chars = zo['characters'] as ICharacter[]
    if (chars) {
      const astra = chars.find((c) => (c.key as string) === 'Astra')
      if (astra) {
        astra.key = 'AstraYao'
        ;(astra as any).id = 'AstraYao'
      }
    }

    const charOpts = zo['charOpts'] as CharOpt[]
    if (charOpts) {
      const astraOpt = charOpts.find(
        (c) => ((c as any)['id'] as string) === 'Astra'
      )
      if (astraOpt) {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(astraOpt as any)['id'] = 'AstraYao'
        if (astraOpt.target?.sheet === 'Astra') {
          astraOpt.target.sheet = 'AstraYao'
        }
        if (astraOpt.conditionals) {
          astraOpt.conditionals
            .filter((cond) => (cond.src as string) === 'Astra')
            .forEach((cond) => (cond.src = 'AstraYao'))
        }
      }
    }

    const charMetas = zo['charMetas'] as ICharMeta[]
    if (charMetas) {
      const astraMeta = charMetas.find(
        (c) => ((c as any)['id'] as string) === 'Astra'
      )
      if (astraMeta) {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(astraMeta as any)['id'] = 'AstraYao'
      }
    }

    const discs = zo.discs
    if (discs) {
      discs
        .filter((disc) => (disc.location as string) === 'Astra')
        .forEach((disc) => (disc.location = 'AstraYao'))
    }

    const weng = zo['wengines'] as IWengine[]
    if (weng) {
      weng
        .filter((weng) => (weng.location as string) === 'Astra')
        .forEach((weng) => (weng.location = 'AstraYao'))
    }
  })

  zo.dbVersion = currentDBVersion
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
  return zo
}

/**
 * Migrate parsed data in `storage` in-place to a parsed data of the latest supported DB version.
 *
 * **CAUTION**
 * Throw an error if `storage` uses unsupported DB version.
 */
export function migrateStorage(storage: DBStorage) {
  const version = storage.getDBVersion()

  function migrateVersion(version: number, cb: () => void) {
    const dbver = storage.getDBVersion()
    if (dbver < version) {
      cb()
      // Update version upon each successful migration, so we don't
      // need to migrate that part again if later parts fail.
      storage.setDBVersion(version)
    }
  }

  migrateVersion(2, () => {
    const keys = storage.keys
    for (const key of keys) {
      if (key === 'zzz_character_Astra') {
        const astra = storage.get(key)
        astra.key = 'AstraYao'
        storage.set('zzz_character_AstraYao', astra)
        storage.remove('zzz_character_Astra')
      }
      if (key === 'zzz_charOpt_Astra') {
        const astra = storage.get(key)
        astra.id = 'AstraYao'

        if (astra.target?.sheet === 'Astra') {
          astra.target.sheet = 'AstraYao'
        }

        if (astra.conditionals) {
          astra.conditionals
            .filter((c: any) => c.src === 'Astra')
            .forEach((c: any) => (c.src = 'AstraYao'))
        }

        storage.set('zzz_charOpt_AstraYao', astra)
        storage.remove('zzz_charOpt_Astra')
      }
      if (key === 'zzz_charMeta_Astra') {
        const astra = storage.get(key)
        astra.id = 'AstraYao'
        storage.set('zzz_charMeta_AstraYao', astra)
      }
      if (key.startsWith('zzz_disc_')) {
        const disc = storage.get(key)
        if (disc.location === 'Astra') {
          disc.location = 'AstraYao'
          storage.set(key, disc)
        }
      }
      if (key.startsWith('zzz_wengine_')) {
        const weng = storage.get(key)
        if (weng.location === 'Astra') {
          weng.location = 'AstraYao'
          storage.set(key, weng)
        }
      }
    }
  })

  storage.setDBVersion(currentDBVersion)
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
}
