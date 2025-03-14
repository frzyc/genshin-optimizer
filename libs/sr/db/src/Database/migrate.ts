// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateSr` function
// 2. Add new `migrateVersion` call within `migrateStorage` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

import type { DBStorage } from '@genshin-optimizer/common/database'
import type { ISrObjectDescription } from '@genshin-optimizer/sr/srod'
import type { ISroDatabase } from '../Interfaces'

export const currentDBVersion = 1

export function migrateSr(
  sr: ISrObjectDescription & ISroDatabase,
): ISrObjectDescription & ISroDatabase {
  const version = sr.dbVersion ?? 0
  // function migrateVersion(version: number, cb: () => void) {
  //   const dbver = sr.dbVersion ?? 0
  //   if (dbver < version) {
  //     cb()
  //     // Update version upon each successful migration, so we don't
  //     // need to migrate that part again if later parts fail.
  //     sr.dbVersion = version
  //   }
  // }

  // migrateVersion(2, () => {})

  sr.dbVersion = currentDBVersion
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
  return sr
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
