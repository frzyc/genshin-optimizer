import { createContext } from "react";
import { TeamData } from "../Context/DataContext";
import { CharacterKey } from "../Types/consts";
import { ArtifactDataManager } from "./Data/ArtifactData";
import { BuildsettingDataManager } from "./Data/BuildsettingData";
import { CharacterDataManager } from "./Data/CharacterData";
import { CharacterTCDataManager } from "./Data/CharacterTCData";
import { StateDataManager } from "./Data/StateData";
import { WeaponDataManager } from "./Data/WeaponData";
import { DBStorage } from "./DBStorage";
import { migrate } from "./imports/migrate";

export class ArtCharDatabase {
  storage: DBStorage
  arts: ArtifactDataManager
  chars: CharacterDataManager
  charTCs: CharacterTCDataManager
  weapons: WeaponDataManager
  states: StateDataManager
  buildSettings: BuildsettingDataManager
  teamData: Partial<Record<CharacterKey, TeamData>> = {}

  constructor(storage: DBStorage) {
    this.storage = storage

    migrate(storage)
    this.chars = new CharacterDataManager(this)

    // Artifacts needs to be instantiated after character to check for relations
    this.arts = new ArtifactDataManager(this)

    // Weapons needs to be instantiated after character to check for relations
    this.weapons = new WeaponDataManager(this)

    this.weapons.ensureEquipment()

    this.states = new StateDataManager(this)

    // This should be instantiated after artifacts, so that invalid artifacts that persists in build results can be pruned.
    this.buildSettings = new BuildsettingDataManager(this)

    this.charTCs = new CharacterTCDataManager(this)

    // invalidates character when things change.
    this.chars.followAny((key) => {
      this.invalidateTeamData(key as CharacterKey)
      this.states.set("dbMeta", { lastEdit: Date.now() })
    })
    this.arts.followAny(() => {
      this.states.set("dbMeta", { lastEdit: Date.now() })
    })
    this.weapons.followAny(() => {
      this.states.set("dbMeta", { lastEdit: Date.now() })
    })
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
    [this.arts, this.chars, this.weapons, this.states, this.buildSettings].map(dm => dm.clear())
    this.teamData = {}
  }
  get gender() {
    const gender: "F" | "M" = (this.states.get("dbMeta") as any)?.gender ?? "F"
    return gender
  }
}
export type DatabaseContextObj = {
  database: ArtCharDatabase,
  setDatabase: (db: ArtCharDatabase) => void
}
export const DatabaseContext = createContext({} as DatabaseContextObj)
