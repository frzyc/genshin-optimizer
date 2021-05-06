import ArtifactDatabase from "../Database/ArtifactDatabase"
import CharacterDatabase from "../Database/CharacterDatabase"
import { IArtifact } from "../Types/artifact"
import { allSlotKeys, SlotKey } from "../Types/consts"
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

describe('Equipment functions', () => {
  let a: IArtifact, b: IArtifact, c: IArtifact, d: IArtifact, e: IArtifact,
    aID: string, bID: string, cID: string, dID: string, eID: string,
    abcde: StrictDict<SlotKey, string>, empty: StrictDict<SlotKey, "">
  let noelle, ningguang
  beforeEach(() => {
    ArtifactDatabase.clearDatabase()
    CharacterDatabase.clearDatabase()
    localStorage.clear()

    a = {
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
    b = { ...a, slotKey: "plume" }
    c = { ...a, slotKey: "sands", location: "noelle" }
    d = { ...a, slotKey: "goblet", location: "noelle" }
    e = { ...a, slotKey: "circlet", location: "noelle" }
    aID = ArtifactDatabase.update(a)
    bID = ArtifactDatabase.update(b)
    cID = ArtifactDatabase.update(c)
    dID = ArtifactDatabase.update(d)
    eID = ArtifactDatabase.update(e)
    abcde = {
      flower: aID,
      plume: bID,
      sands: cID,
      goblet: dID,
      circlet: eID
    }
    empty = Object.fromEntries(allSlotKeys.map(sk => [sk, ""])) as StrictDict<SlotKey, "">

    ArtifactDatabase.update(a)
    noelle = {
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
    ningguang = {
      characterKey: "ningguang",
      equippedArtifacts: empty,
      levelKey: "lvl"
    }
    CharacterDatabase.update(noelle)
    CharacterDatabase.update(ningguang)
  })
  describe('Character.equipArtifacts', () => {
    test('unequip from one character to another', () => {
      //finish setup, time to test!
      Character.equipArtifacts("ningguang", abcde)

      const ningguangDB = CharacterDatabase.get("ningguang")
      expect(ningguangDB?.equippedArtifacts).toEqual(abcde)

      const noelleDB = CharacterDatabase.get("noelle")
      expect(noelleDB?.equippedArtifacts).toEqual(empty)

      Object.values(abcde).forEach(id => expect(ArtifactDatabase.get(id).location).toBe("ningguang"))
    })
    test(`unequip`, () => {
      Character.equipArtifacts("noelle", empty)
      const noelleDB = CharacterDatabase.get("noelle")
      expect(noelleDB?.equippedArtifacts).toEqual(empty)
      Object.values(abcde).forEach(id => expect(ArtifactDatabase.get(id).location).toBe(""))
    })
  })
  test(`Character.remove`, () => {
    Character.remove("noelle")
    const noelleDB = CharacterDatabase.get("noelle")
    expect(noelleDB).toBe(undefined)
    Object.values(abcde).forEach(id => expect(ArtifactDatabase.get(id).location).toBe(""))
  })

})
