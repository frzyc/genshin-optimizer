import type { DBStorage } from '@genshin-optimizer/common/database'
import { Database, SandboxStorage } from '@genshin-optimizer/common/database'
import type { GenderKey } from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import { DBMetaEntry } from './DataEntries/DBMetaEntry'
import { DisplayArtifactEntry } from './DataEntries/DisplayArtifactEntry'
import { DisplayCharacterEntry } from './DataEntries/DisplayCharacterEntry'
import { DisplayOptimizeEntry } from './DataEntries/DisplayOptimizeEntry'
import { DisplayToolEntry } from './DataEntries/DisplayTool'
import { DisplayWeaponEntry } from './DataEntries/DisplayWeaponEntry'
import { ArtifactDataManager } from './DataManagers/ArtifactDataManager'
import { BuildDataManager } from './DataManagers/BuildDataManager'
import { BuildTcDataManager } from './DataManagers/BuildTcDataManager'
import { CharMetaDataManager } from './DataManagers/CharMetaDataManager'
import { CharacterDataManager } from './DataManagers/CharacterDataManager'
import { OptConfigDataManager } from './DataManagers/OptConfigDataManager'
import { TeamCharacterDataManager } from './DataManagers/TeamCharacterDataManager'
import { TeamDataManager } from './DataManagers/TeamDataManager'
import { WeaponDataManager } from './DataManagers/WeaponDataManager'
import type { IGO, ImportResult } from './exim'
import { GOSource, newImportResult } from './exim'
import { currentDBVersion, migrate, migrateGOOD } from './migrate'
export class ArtCharDatabase extends Database {
  arts: ArtifactDataManager
  chars: CharacterDataManager
  buildTcs: BuildTcDataManager
  weapons: WeaponDataManager
  optConfigs: OptConfigDataManager
  charMeta: CharMetaDataManager
  builds: BuildDataManager
  teamChars: TeamCharacterDataManager
  teams: TeamDataManager

  dbMeta: DBMetaEntry
  displayWeapon: DisplayWeaponEntry
  displayArtifact: DisplayArtifactEntry
  displayOptimize: DisplayOptimizeEntry
  displayCharacter: DisplayCharacterEntry
  displayTool: DisplayToolEntry
  dbIndex: 1 | 2 | 3 | 4
  dbVer: number

  constructor(dbIndex: 1 | 2 | 3 | 4, storage: DBStorage) {
    super(storage)
    migrate(storage)
    // Transfer non DataManager/DataEntry data from storage
    this.dbIndex = dbIndex
    this.dbVer = storage.getDBVersion()
    this.storage.setDBVersion(this.dbVer)
    this.storage.setDBIndex(this.dbIndex)

    // Handle Datamanagers
    this.chars = new CharacterDataManager(this)

    // Weapons needs to be instantiated after character to check for relations
    this.weapons = new WeaponDataManager(this)

    // Artifacts needs to be instantiated after character to check for relations
    this.arts = new ArtifactDataManager(this)

    this.weapons.ensureEquipments()

    // Depends on arts
    this.optConfigs = new OptConfigDataManager(this)

    this.buildTcs = new BuildTcDataManager(this)
    this.charMeta = new CharMetaDataManager(this)

    this.builds = new BuildDataManager(this)

    // Depends on builds, buildTcs, and optConfigs
    this.teamChars = new TeamCharacterDataManager(this)

    // Depends on TeamChar
    this.teams = new TeamDataManager(this)

    // Handle DataEntries
    this.dbMeta = new DBMetaEntry(this)
    this.displayWeapon = new DisplayWeaponEntry(this)
    this.displayArtifact = new DisplayArtifactEntry(this)
    this.displayOptimize = new DisplayOptimizeEntry(this)
    this.displayCharacter = new DisplayCharacterEntry(this)
    this.displayTool = new DisplayToolEntry(this)

    // invalidates character when things change.
    this.chars.followAny(() => {
      this.dbMeta.set({ lastEdit: Date.now() })
    })
    this.arts.followAny(() => {
      this.dbMeta.set({ lastEdit: Date.now() })
    })
    this.weapons.followAny(() => {
      this.dbMeta.set({ lastEdit: Date.now() })
    })
  }
  get dataManagers() {
    // IMPORTANT: it must be chars, weapon, arts in order, to respect import order
    return [
      this.chars,
      this.weapons,
      this.arts,
      this.optConfigs,
      this.buildTcs,
      this.charMeta,
      this.builds,
      this.teamChars,
      this.teams,
    ] as const
  }
  get dataEntries() {
    return [
      this.dbMeta,
      this.displayWeapon,
      this.displayArtifact,
      this.displayOptimize,
      this.displayCharacter,
      this.displayTool,
    ] as const
  }

  clear() {
    this.dataManagers.map((dm) => dm.clear())
    this.dataEntries.map((de) => de.clear())
  }
  get gender() {
    const gender: GenderKey = this.dbMeta.get().gender ?? 'F'
    return gender
  }
  exportGOOD() {
    const good: Partial<IGO & IGOOD> = {
      format: 'GOOD',
      dbVersion: currentDBVersion,
      source: GOSource,
      version: 1,
    }
    this.dataManagers.map((dm) => dm.exportGOOD(good))
    this.dataEntries.map((de) => de.exportGOOD(good))
    return good as IGO & IGOOD
  }
  importGOOD(
    good: IGOOD & IGO,
    keepNotInImport: boolean,
    ignoreDups: boolean
  ): ImportResult {
    good = migrateGOOD(good)
    const source = good.source ?? 'Unknown'
    // Some Scanners might carry their own id field, which would conflict with GO dup resolution.
    if (source !== 'Genshin Optimizer') {
      good.artifacts?.forEach(
        (a) => delete (a as unknown as { id?: string }).id
      )
      good.weapons?.forEach((a) => delete (a as unknown as { id?: string }).id)
    }
    const result: ImportResult = newImportResult(
      source,
      keepNotInImport,
      ignoreDups
    )

    // Follow updates from char/art/weapon to gather import results
    const unfollows = [
      this.chars.followAny((key, reason, value) => {
        const arr = result.characters[reason]
        const ind = arr.findIndex((c) => c?.key === key)
        if (ind < 0) arr.push(value)
        else arr[ind] = value
      }),
      this.arts.followAny((key, reason, value) =>
        result.artifacts[reason].push(value)
      ),
      this.weapons.followAny((key, reason, value) =>
        result.weapons[reason].push(value)
      ),
    ]

    this.dataManagers.map((dm) => dm.importGOOD(good, result))
    this.dataEntries.map((de) => de.importGOOD(good, result))
    this.weapons.ensureEquipments()
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
  swapStorage(other: ArtCharDatabase) {
    this.clearStorage()
    other.clearStorage()

    const thisStorage = this.storage
    this.storage = other.storage
    other.storage = thisStorage

    this.saveStorage()
    other.saveStorage()
  }
  toExtraLocalDB() {
    const key = `extraDatabase_${this.storage.getDBIndex()}`
    const other = new SandboxStorage()
    const oldstorage = this.storage
    this.storage = other
    this.saveStorage()
    this.storage = oldstorage
    localStorage.setItem(key, JSON.stringify(Object.fromEntries(other.entries)))
  }
}
