import { createContext } from "react";
import { TeamData } from "../Context/DataContext";
import { CharacterKey, Gender } from "../Types/consts";
import { DBMetaEntry } from "./DataEntries/DBMetaEntry";
import { DisplayArtifactEntry } from "./DataEntries/DisplayArtifactEntry";
import { DisplayCharacterEntry } from "./DataEntries/DisplayCharacterEntry";
import { DisplayOptimizeEntry } from "./DataEntries/DisplayOptimizeEntry";
import { DisplayToolEntry } from "./DataEntries/DisplayTool";
import { DisplayWeaponEntry } from "./DataEntries/DisplayWeaponEntry";
import { ArtifactDataManager } from "./DataManagers/ArtifactData";
import { BuildsettingDataManager } from "./DataManagers/BuildsettingData";
import { CharacterDataManager } from "./DataManagers/CharacterData";
import { CharacterTCDataManager } from "./DataManagers/CharacterTCData";
import { CharMetaDataManager } from "./DataManagers/CharMetaData";
import { WeaponDataManager } from "./DataManagers/WeaponData";
import { DBStorage } from "./DBStorage";
import { GOSource, IGO, IGOOD, ImportResult, newImportResult } from "./exim";
import { currentDBVersion, migrate, migrateGOOD } from "./migrate";

export class ArtCharDatabase {
  storage: DBStorage
  arts: ArtifactDataManager
  chars: CharacterDataManager
  charTCs: CharacterTCDataManager
  weapons: WeaponDataManager
  buildSettings: BuildsettingDataManager
  charMeta: CharMetaDataManager
  teamData: Partial<Record<CharacterKey, TeamData>> = {}

  dbMeta: DBMetaEntry
  displayWeapon: DisplayWeaponEntry
  displayArtifact: DisplayArtifactEntry
  displayOptimize: DisplayOptimizeEntry
  displayCharacter: DisplayCharacterEntry
  displayTool: DisplayToolEntry

  constructor(storage: DBStorage) {
    this.storage = storage

    migrate(storage)
    this.chars = new CharacterDataManager(this)

    // Weapons needs to be instantiated after character to check for relations
    this.weapons = new WeaponDataManager(this)

    // Artifacts needs to be instantiated after character to check for relations
    this.arts = new ArtifactDataManager(this)

    this.weapons.ensureEquipment()

    // This should be instantiated after artifacts, so that invalid artifacts that persists in build results can be pruned.
    this.buildSettings = new BuildsettingDataManager(this)

    this.charTCs = new CharacterTCDataManager(this)
    this.charMeta = new CharMetaDataManager(this)

    this.dbMeta = new DBMetaEntry(this)
    this.displayWeapon = new DisplayWeaponEntry(this)
    this.displayArtifact = new DisplayArtifactEntry(this)
    this.displayOptimize = new DisplayOptimizeEntry(this)
    this.displayCharacter = new DisplayCharacterEntry(this)
    this.displayTool = new DisplayToolEntry(this)

    // invalidates character when things change.
    this.chars.followAny((key) => {
      this.invalidateTeamData(key as CharacterKey)
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
    return [this.chars, this.weapons, this.arts, this.buildSettings, this.charMeta] as const
  }
  get dataEntries() {
    return [this.dbMeta, this.displayWeapon, this.displayArtifact, this.displayOptimize, this.displayCharacter, this.displayTool] as const
  }

  _getTeamData(key: CharacterKey) {
    return this.teamData[key]
  }
  cacheTeamData(key: CharacterKey, data: TeamData) {
    this.teamData[key] = data
  }
  invalidateTeamData(key: CharacterKey | "") {
    delete this.teamData[key]
    Object.entries(this.teamData).forEach(([k, teamData]) => teamData[key] && delete this.teamData[k])
  }
  clear() {
    this.dataManagers.map(dm => dm.clear())
    this.teamData = {};
    this.dataEntries.map(de => de.reset())
  }
  get gender() {
    const gender: Gender = this.dbMeta.get().gender ?? "F"
    return gender
  }
  exportGOOD() {
    const good = {
      format: "GOOD",
      dbVersion: currentDBVersion,
      source: GOSource,
      version: 1,
    } as Partial<IGO & IGOOD>
    this.dataManagers.map(dm => dm.exportGOOD(good));
    this.dataEntries.map(de => de.exportGOOD(good))
    return good as IGO & IGOOD
  }
  importGOOD(good: IGOOD & IGO, keepNotInImport: boolean, ignoreDups: boolean): ImportResult {
    good = migrateGOOD(good)
    const source = good.source ?? "Unknown"
    const result: ImportResult = newImportResult(source, keepNotInImport, ignoreDups);

    const unfollows = [
      this.chars.followAny((key, reason, value) => {
        const arr = result.characters[reason]
        const ind = arr.findIndex(c => c?.key === key)
        if (ind < 0) arr.push(value)
        else arr[ind] = value
      }),
      this.arts.followAny((key, reason, value) => result.artifacts[reason].push(value)),
      this.weapons.followAny((key, reason, value) => result.weapons[reason].push(value)),
    ]

    this.dataManagers.map(dm => dm.importGOOD(good, result));
    this.dataEntries.map(de => de.importGOOD(good, result))

    unfollows.map(f => f())

    return result
  }
}
export type DatabaseContextObj = {
  database: ArtCharDatabase,
  setDatabase: (db: ArtCharDatabase) => void
}
export const DatabaseContext = createContext({} as DatabaseContextObj)
