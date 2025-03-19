// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateSr` function
// 2. Add new `migrateVersion` call within `migrateStorage` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

import type { DBStorage } from '@genshin-optimizer/common/database'
import type { IZZZDatabase, IZenlessObjectDescription } from '../Interfaces'

export const currentDBVersion = 1

export function migrateZOD(
  zo: IZenlessObjectDescription & IZZZDatabase
): IZenlessObjectDescription & IZZZDatabase {
  const version = zo.dbVersion ?? 0
  // function migrateVersion(version: number, cb: () => void) {
  //   const dbver = zo.dbVersion ?? 0
  //   if (dbver < version) {
  //     cb()
  //     // Update version upon each successful migration, so we don't
  //     // need to migrate that part again if later parts fail.
  //     zo.dbVersion = version
  //   }
  // }

  // migrateVersion(2, () => {})

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

  // function migrateVersion(version: number, cb: () => void) {
  //   const dbver = storage.getDBVersion()
  //   if (dbver < version) {
  //     cb()
  //     // Update version upon each successful migration, so we don't
  //     // need to migrate that part again if later parts fail.
  //     storage.setDBVersion(version)
  //   }
  // }

  // migrateVersion(2, () => {})

  storage.setDBVersion(currentDBVersion)
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
}
