import CharacterDatabase from "./CharacterDatabase"
import ArtifactDatabase from "./ArtifactDatabase"
import { DatabaseInitAndVerify, createDatabaseObj, loadDatabaseObj } from "./DatabaseUtil"
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util"
import { chars, arts, artifactDisplay, characterDisplay, buildsDisplay } from './DataBaseUtil.test.data'
import { text } from "@fortawesome/fontawesome-svg-core"
beforeEach(() => {
  localStorage.clear()
  CharacterDatabase.clearDatabase()
  ArtifactDatabase.clearDatabase()
})
afterEach(() => localStorage.clear())
describe('DatabaseUtil Tests', () => {
  describe('dbVersion 2', () => {
    test('should Convert old characters to unique', () => {
      const characterKey = "testCharKey"
      const character_1 = {
        id: "character_1",
        name: "TEST1",
        characterKey,
        levelKey: "L1",
        buildSetting: {
          mainStat: ["ener_rech", "crit_dmg", "hp_"],
          statFilters: { pyro_ele_res: {}, crit_dmg: {}, hp_final: {} }
        },
        dmgMode: "crit_dmg",
        equippedArtifacts: { "slot1": "artifact_1", "slot2": "artifact_2" }//will get equipped to `characterKey`
      }
      const expectedBuildSetting = {
        mainStat: ["enerRech_", "critDMG_", "hp_"],
        statFilters: { pyro_res_: {}, critDMG_: {}, finalHP: {} }
      }

      const character_2 = {
        id: "character_2",
        name: "TEST2",
        characterKey,
        levelKey: "L1",
        buildSetting: { somethingelse: "somethingelse" },
        equippedArtifacts: { "slot1": "artifact_3" }//will get unequipped
      }
      localStorage.setItem("character_1", JSON.stringify(character_1))
      localStorage.setItem("character_2", JSON.stringify(character_2))
      const artCommon = { setKey: "set", numStars: 5, mainStatKey: "mainStat" }
      const artifact_1 = { id: "artifact_1", location: "character_1", slotKey: "slot1", ...artCommon }
      const artifact_2 = { id: "artifact_2", location: "character_1", slotKey: "slot2", ...artCommon }
      const artifact_3 = { id: "artifact_3", location: "character_2", slotKey: "slot1", ...artCommon }
      localStorage.setItem("artifact_1", JSON.stringify(artifact_1))
      localStorage.setItem("artifact_2", JSON.stringify(artifact_2))
      localStorage.setItem("artifact_3", JSON.stringify(artifact_3))
      localStorage.setItem("db_ver", "1")

      //should generate unique character from character_1
      DatabaseInitAndVerify()
      const { id, name, dmgMode, ...rest } = character_1
      expect(CharacterDatabase.get(characterKey)).toEqual({ ...rest, hitMode: "critHit", buildSetting: expectedBuildSetting })
      expect(ArtifactDatabase.get("artifact_1").location).toBe(characterKey)
      expect(ArtifactDatabase.get("artifact_2").location).toBe(characterKey)
      expect(ArtifactDatabase.get("artifact_3").location).toBe("")
    })
    test('should Convert old artifacts to new keys', () => {
      const artCommon = { setKey: "set", numStars: 5, location: "", slotKey: "slot" }
      const artifact_1 = { id: "artifact_1", mainStatKey: "phy_dmg_bonus", ...artCommon }//phy_dmg_bonus should convert to physical_dmg_
      const wrongSubstats = [{ key: "ele_mas", value: 999 }, { key: "crit_rate", value: 999 }]
      const exptectSubstats = [{ key: "eleMas", value: 999 }, { key: "critRate_", value: 999 }]
      const artifact_2 = { id: "artifact_2", mainStatKey: "hp_", substats: wrongSubstats, ...artCommon }
      localStorage.setItem("artifact_1", JSON.stringify(artifact_1))
      localStorage.setItem("artifact_2", JSON.stringify(artifact_2))
      localStorage.setItem("db_ver", "1")

      DatabaseInitAndVerify()
      expect(ArtifactDatabase.get("artifact_1")).toEqual({ ...artifact_1, mainStatKey: "physical_dmg_" })
      expect(ArtifactDatabase.get("artifact_2")).toEqual({ ...artifact_2, substats: exptectSubstats })
    })
    test('should Update ArtifactDisplay.state', () => {
      const state = {
        filterMainStatKey: "geo_ele_dmg_bonus",
        filterSubstats: ["ener_rech", "crit_dmg", "hp_", ""]
      }
      saveToLocalStorage("ArtifactDisplay.state", state)
      localStorage.setItem("db_ver", "1")

      const expectedState = {
        filterMainStatKey: "geo_dmg_",
        filterSubstats: ["enerRech_", "critDMG_", "hp_", ""]
      }
      DatabaseInitAndVerify()
      expect(loadFromLocalStorage("ArtifactDisplay.state")).toEqual(expectedState)
    })
  })
})

describe('Able to export database and revert.', () => {
  const expectedDBbj = deepClone({ version: 2, characterDatabase: chars, artifactDatabase: arts, artifactDisplay, characterDisplay, buildsDisplay })
  function setupLS() {
    Object.entries(chars).map(([id, char]) => saveToLocalStorage(`char_${id}`, char))
    Object.entries(arts).map(([id, art]) => saveToLocalStorage(id, art))
    saveToLocalStorage("ArtifactDisplay.state", artifactDisplay)
    saveToLocalStorage("CharacterDisplay.state", characterDisplay)
    saveToLocalStorage("BuildsDisplay.state", buildsDisplay)
    localStorage.setItem("db_ver", "2")
  }
  test('should generate DB obj, ', () => {
    setupLS()
    DatabaseInitAndVerify()
    const dbObj = createDatabaseObj()
    expect(dbObj).toEqual(expectedDBbj)
  })
  text('should generate same LocalStorage from object', () => {
    expect(localStorage.keys()).toBe([])
    loadDatabaseObj(expectedDBbj)
    Object.entries(chars).map(([id, char]) => expect(loadFromLocalStorage(`char_${id}`)).toEqual(char))
    Object.entries(arts).map(([id, art]) => expect(loadFromLocalStorage(id)).toEqual(art))
    loadFromLocalStorage("ArtifactDisplay.state").toEqual(artifactDisplay)
    loadFromLocalStorage("CharacterDisplay.state").toEqual(characterDisplay)
    loadFromLocalStorage("BuildsDisplay.state").toEqual(buildsDisplay)
    loadFromLocalStorage("db_ver").toEqual(2)
  })
})
