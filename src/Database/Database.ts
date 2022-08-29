import { createContext } from "react";
import { TeamData } from "../Context/DataContext";
import { CharacterKey } from "../Types/consts";
import { DBStorage } from "./DBStorage";
import { ArtifactDataManager } from "./Data/ArtifactData";
import { BuildsettingDataManager } from "./Data/BuildsettingData";
import { CharacterDataManager } from "./Data/CharacterData";
import { StateDataManager } from "./Data/StateData";
import { WeaponDataManager } from "./Data/WeaponData";
import { migrate } from "./imports/migrate";
import { CharacterTCDataManager } from "./Data/CharacterTCData";

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

    this.states = new StateDataManager(this)
    this.buildSettings = new BuildsettingDataManager(this)

    this.charTCs = new CharacterTCDataManager(this)

    // invalidates character when things change.
    this.chars.followAny((key) => {
      if (typeof key === "string")
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
}
export type DatabaseContextObj = {
  database: ArtCharDatabase,
  setDatabase: (db: ArtCharDatabase) => void
}
export const DatabaseContext = createContext({} as DatabaseContextObj)
