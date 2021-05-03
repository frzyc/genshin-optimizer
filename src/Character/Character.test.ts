import ArtifactDatabase from "../Database/ArtifactDatabase"
import CharacterDatabase from "../Database/CharacterDatabase"
import { IArtifact } from "../Types/artifact"
import { allSlotKeys } from "../Types/consts"
import WeaponSheet from "../Weapon/WeaponSheet"
import Character from "./Character"
import CharacterSheet from "./CharacterSheet"

describe('Character.mergeStats()', () => {
  test('should merge stats', () => {
    const initial = { a: 1, b: 1 }, stats = { b: 1, c: 3 }
    Character.mergeStats(initial, stats)
    expect(initial).toEqual({ a: 1, b: 2, c: 3 })
  })
  test('should merge modifiers', () => {
    const initial = { modifiers: { a: { b: 1, c: 1 } } }, stats = { modifiers: { a: { b: 1 }, d: { e: 1 } } }
    Character.mergeStats(initial, stats)
    expect(initial).toEqual({ modifiers: { a: { b: 2, c: 1 }, d: { e: 1 } } })
  })
})

describe('Character.getDisplayStatKeys()', () => {
  const characterKey = "noelle"

  beforeEach(() => CharacterDatabase.update({ characterKey, levelKey: "L60A", weapon: { key: "Whiteblind" } }))
  afterEach(() => localStorage.clear())
  test('should get statKeys for characters with finished talent page', async () => {
    const character = CharacterDatabase.get(characterKey)
    const characterSheet = await CharacterSheet.get(characterKey)
    expect(character).toBeTruthy()
    if (!character) return
    const weaponSheet = await WeaponSheet.get(character.weapon.key)
    expect(characterSheet).toBeInstanceOf(CharacterSheet)
    expect(weaponSheet).toBeInstanceOf(WeaponSheet)
    if (!characterSheet || !weaponSheet) return
    const initialStats = Character.createInitialStats(character, characterSheet, weaponSheet)
    const keys = characterSheet.getDisplayStatKeys(initialStats)
    expect(keys).toHaveProperty("auto")
  })
})

describe('Character.equipArtifacts', () => {
  /**
   * To validate bug:
   * charA has artifacts a,b,c
   * equip a,b,c to charB
   * charA still has artifacts equipped
   * a,b,c, still has .location B.
   * expect: charA to be empty, a,b,c location to be charB
   * 
   */
  test('test equip of artifacts from one char to another', () => {
    ArtifactDatabase.clearDatabase()
    CharacterDatabase.clearDatabase()
    localStorage.clear()

    const a: IArtifact = {
      setKey: "GladiatorsFinale",
      numStars: 5,
      level: 20,
      mainStatKey: "eleMas",
      slotKey: "flower",
      mainStatVal: 100,
      substats: [],
      location: "",
      lock: false
    }
    const b = { ...a, slotKey: "plume" }
    const c = { ...a, slotKey: "sands", location: "noelle" }
    const d = { ...a, slotKey: "goblet", location: "noelle" }
    const e = { ...a, slotKey: "circlet", location: "noelle" }
    const aID = ArtifactDatabase.update(a)
    const bID = ArtifactDatabase.update(b)
    const cID = ArtifactDatabase.update(c)
    const dID = ArtifactDatabase.update(d)
    const eID = ArtifactDatabase.update(e)
    const abcde = {
      flower: aID,
      plume: bID,
      sands: cID,
      goblet: dID,
      circlet: eID
    }
    const empty = Object.fromEntries(allSlotKeys.map(sk => [sk, ""]))

    ArtifactDatabase.update(a)
    const noelle = {
      characterKey: "noelle",
      equippedArtifacts: {
        flower: "",
        plume: "",
        sands: cID,
        goblet: dID,
        circlet: eID
      },
      levelKey: "lvl"
    }
    const ningguang = {
      characterKey: "ningguang",
      equippedArtifacts: empty,
      levelKey: "lvl"
    }
    CharacterDatabase.update(noelle)
    CharacterDatabase.update(ningguang)

    //finish setup, time to test!
    Character.equipArtifacts("ningguang", abcde)

    const ningguangDB = CharacterDatabase.get("ningguang")
    expect(ningguangDB?.equippedArtifacts).toEqual(abcde)

    const noelleDB = CharacterDatabase.get("noelle")
    expect(noelleDB?.equippedArtifacts).toEqual(empty)

    Object.values(abcde).forEach(id => expect(ArtifactDatabase.get(id).location).toBe("ningguang"))
  })




})
