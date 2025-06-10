// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateSr` function
// 2. Add new `migrateVersion` call within `migrateStorage` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

import type { DBStorage } from '@genshin-optimizer/common/database'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
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

  // Change code name keys to char name keys
  migrateVersion(2, () => {
    function migrateData(oldKey: string, newKey: CharacterKey) {
      const chars = zo['characters'] as ICharacter[]
      if (chars) {
        const char = chars.find((c) => (c.key as string) === oldKey)
        if (char) {
          char.key = newKey
          ;(char as any).id = newKey
        }
      }

      const charOpts = zo['charOpts'] as CharOpt[]
      if (charOpts) {
        const charOpt = charOpts.find(
          (c) => ((c as any)['id'] as string) === oldKey
        )
        if (charOpt) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(charOpt as any)['id'] = newKey
          if (charOpt.target?.sheet === oldKey) {
            charOpt.target.sheet = newKey
          }
          if (charOpt.conditionals) {
            charOpt.conditionals
              .filter((cond) => (cond.src as string) === oldKey)
              .forEach((cond) => (cond.src = newKey))
          }
        }
      }

      const charMetas = zo['charMetas'] as ICharMeta[]
      if (charMetas) {
        const charMeta = charMetas.find(
          (c) => ((c as any)['id'] as string) === oldKey
        )
        if (charMeta) {
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(charMeta as any)['id'] = newKey
        }
      }

      const discs = zo.discs
      if (discs) {
        discs
          .filter((disc) => (disc.location as string) === oldKey)
          .forEach((disc) => (disc.location = newKey))
      }

      const weng = zo['wengines'] as IWengine[]
      if (weng) {
        weng
          .filter((weng) => (weng.location as string) === oldKey)
          .forEach((weng) => (weng.location = newKey))
      }
    }
    migrateData('Astra', 'AstraYao')
    migrateData('QingYi', 'Qingyi')
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
    function migrateData(oldKey: string, newKey: CharacterKey) {
      const keys = storage.keys
      for (const key of keys) {
        if (key === `zzz_character_${oldKey}`) {
          const astra = storage.get(key)
          astra.key = newKey
          storage.set(`zzz_character_${newKey}`, astra)
          storage.remove(`zzz_character_${oldKey}`)
        }
        if (key === `zzz_charOpt_${oldKey}`) {
          const astra = storage.get(key)
          astra.id = newKey

          if (astra.target?.sheet === oldKey) {
            astra.target.sheet = newKey
          }

          if (astra.conditionals) {
            astra.conditionals
              .filter((c: any) => c.src === oldKey)
              .forEach((c: any) => (c.src = newKey))
          }

          storage.set(`zzz_charOpt_${newKey}`, astra)
          storage.remove(`zzz_charOpt_${oldKey}`)
        }
        if (key === `zzz_charMeta_${oldKey}`) {
          const astra = storage.get(key)
          astra.id = newKey
          storage.set(`zzz_charMeta_${newKey}`, astra)
          storage.remove(`zzz_charMeta_${oldKey}`)
        }
        if (key.startsWith('zzz_disc_')) {
          const disc = storage.get(key)
          if (disc.location === oldKey) {
            disc.location = newKey
            storage.set(key, disc)
          }
        }
        if (key.startsWith('zzz_wengine_')) {
          const weng = storage.get(key)
          if (weng.location === oldKey) {
            weng.location = newKey
            storage.set(key, weng)
          }
        }
      }
    }
    migrateData('Astra', 'AstraYao')
    migrateData('QingYi', 'Qingyi')
  })

  storage.setDBVersion(currentDBVersion)
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
}
