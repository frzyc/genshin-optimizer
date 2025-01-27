import type { DBStorage } from '@genshin-optimizer/common/database'
import { Database, SandboxStorage } from '@genshin-optimizer/common/database'
import type { IZenlessObjectDescription, IZZZDatabase } from '../Interfaces'
import { zzzSource } from '../Interfaces'
import { DBMetaEntry, DisplayRelicEntry } from './DataEntries/'
import { DiscDataManager } from './DataManagers/'
import { CharacterDataManager } from './DataManagers/CharacterDataManager'
import type { ImportResult } from './exim'
import { newImportResult } from './exim'
import { currentDBVersion, migrateStorage, migrateZOD } from './migrate'
export class ZzzDatabase extends Database {
  discs: DiscDataManager
  chars: CharacterDataManager
  dbMeta: DBMetaEntry
  displayRelic: DisplayRelicEntry
  dbIndex: 1 | 2 | 3 | 4
  dbVer: number

  keyPrefix = 'zzz'

  constructor(dbIndex: 1 | 2 | 3 | 4, storage: DBStorage) {
    super(storage)
    migrateStorage(storage)
    // Transfer non DataManager/DataEntry data from storage
    this.dbIndex = dbIndex
    this.dbVer = storage.getDBVersion()
    this.storage.setDBVersion(this.dbVer)
    this.storage.setDBIndex(this.dbIndex)

    // Handle Datamanagers
    this.discs = new DiscDataManager(this)
    this.chars = new CharacterDataManager(this)

    // Handle DataEntries
    this.dbMeta = new DBMetaEntry(this)
    this.displayRelic = new DisplayRelicEntry(this)

    this.discs.followAny(() => {
      this.dbMeta.set({ lastEdit: Date.now() })
    })
  }
  get dataManagers() {
    // IMPORTANT: it must be chars, wengines, discs in order, to respect import order
    return [this.discs, this.chars] as const
  }
  get dataEntries() {
    return [this.dbMeta, this.displayRelic] as const
  }

  clear() {
    this.dataManagers.map((dm) => dm.clear())
    this.dataEntries.map((de) => de.clear())
  }
  exportZOD() {
    const zod: Partial<IZZZDatabase & IZenlessObjectDescription> = {
      format: 'ZOD',
      dbVersion: currentDBVersion,
      source: zzzSource,
      version: 1,
    }
    this.dataManagers.map((dm) => dm.exportZOD(zod))
    this.dataEntries.map((de) => de.exportZOD(zod))
    return zod as IZZZDatabase & IZenlessObjectDescription
  }
  importZOD(
    zod: IZenlessObjectDescription & IZZZDatabase,
    keepNotInImport: boolean,
    ignoreDups: boolean
  ): ImportResult {
    zod = migrateZOD(zod)
    const source = zod.source ?? 'Unknown'
    // Some Scanners might carry their own id field, which would conflict with GO dup resolution.
    if (source !== zzzSource) {
      zod.discs?.forEach((a) => delete (a as unknown as { id?: string }).id)
    }
    const result: ImportResult = newImportResult(
      source,
      keepNotInImport,
      ignoreDups
    )

    // Follow updates from char/disc/lightCone to gather import results
    const unfollows = [
      // TODO:
      // this.chars.followAny((key, reason, value) => {
      //   const arr = result.characters[reason]
      //   const ind = arr.findIndex((c) => c?.key === key)
      //   if (ind < 0) arr.push(value)
      //   else arr[ind] = value
      // }),
      this.chars.followAny((_key, reason, value) =>
        result.characters[reason].push(value)
      ),
      this.discs.followAny((_key, reason, value) =>
        result.discs[reason].push(value)
      ),
      // TODO:
      // this.lightCones.followAny((_key, reason, value) =>
      //   result.lightCones[reason].push(value)
      // ),
    ]

    this.dataManagers.map((dm) => dm.importZOD(zod, result))
    this.dataEntries.map((de) => de.importZOD(zod, result))
    unfollows.forEach((f) => f())

    return result
  }
  clearStorage() {
    this.dataManagers.map((dm) => dm.clearStorage())
    this.dataEntries.map((de) => de.clearStorage())
  }
  saveStorage() {
    this.dataManagers.map((dm) => dm.saveStorage())
    this.dataEntries.map((de) => de.saveStorage())
    this.storage.setDBVersion(this.dbVer)
    this.storage.setDBIndex(this.dbIndex)
  }
  swapStorage(other: ZzzDatabase) {
    this.clearStorage()
    other.clearStorage()

    const thisStorage = this.storage
    this.storage = other.storage
    other.storage = thisStorage

    this.saveStorage()
    other.saveStorage()
  }
  toExtraLocalDB() {
    const key = `zzz_extraDatabase_${this.storage.getDBIndex()}`
    const other = new SandboxStorage(undefined, 'zzz')
    const oldstorage = this.storage
    this.storage = other
    this.saveStorage()
    this.storage = oldstorage
    localStorage.setItem(key, JSON.stringify(Object.fromEntries(other.entries)))
  }
}
