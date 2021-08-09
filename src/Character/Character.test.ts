import Artifact from "../Artifact/Artifact"
import { ArtifactSheet } from "../Artifact/ArtifactSheet"
import { database } from "../Database/Database"
import { IArtifact } from "../Types/artifact"
import { allSlotKeys, SlotKey } from "../Types/consts"
import { mergeStats } from "../Util/StatUtil"
import WeaponSheet from "../Weapon/WeaponSheet"
import Character from "./Character"
import CharacterSheet from "./CharacterSheet"

describe('mergeStats()', () => {
  test('should merge stats', () => {
    const initial = { a: 1, b: 1 }, stats = { b: 1, c: 3 }
    mergeStats(initial as any, stats as any)
    expect(initial).toEqual({ a: 1, b: 2, c: 3 })
  })
  test('should merge modifiers', () => {
    const initial = { modifiers: { a: [['string', 'b']] } }, stats = { modifiers: { a: [['string', 'a']], d: [['path', 'b']] } }
    mergeStats(initial as any, stats as any)
    expect(initial).toEqual({ modifiers: { a: [['string', 'b'], ['string', 'a']], d: [['path', 'b']] } })
  })
})

describe('Character.getDisplayStatKeys()', () => {
  const characterKey = "noelle"

  beforeEach(() => database.updateChar({ characterKey, levelKey: "L60A", weapon: { key: "Whiteblind" } } as any))
  afterEach(() => localStorage.clear())
  test('should get statKeys for characters with finished talent page', async () => {
    const artifactSheets = await ArtifactSheet.getAll()
    const character = database._getChar(characterKey)
    const characterSheet = await CharacterSheet.get(characterKey)
    expect(character).toBeTruthy()
    if (!character) return
    const weaponSheet = await WeaponSheet.get(character.weapon.key)
    expect(characterSheet).toBeInstanceOf(CharacterSheet)
    expect(weaponSheet).toBeInstanceOf(WeaponSheet)
    if (!characterSheet || !weaponSheet || !artifactSheets) return
    const initialStats = Character.createInitialStats(character, characterSheet, weaponSheet)
    const keys = Character.getDisplayStatKeys(initialStats, { characterSheet, weaponSheet, artifactSheets })
    expect(keys).toHaveProperty("talentKey_auto")
  })
})

describe('Equipment functions', () => {
  let a: IArtifact, b: IArtifact, c: IArtifact, d: IArtifact, e: IArtifact,
    abcde: StrictDict<SlotKey, string>, empty: StrictDict<SlotKey, "">
  let noelle, ningguang
  beforeEach(() => {
    database.clear()
    localStorage.clear()

    a = {
      id: "",
      setKey: "GladiatorsFinale",
      numStars: 5,
      level: 20,
      mainStatKey: "eleMas",
      mainStatVal: Artifact.mainStatValue('eleMas', 5, 20),
      slotKey: "flower",
      substats: [],
      location: "",
      lock: false
    }
    b = { ...a, slotKey: "plume" }
    c = { ...a, slotKey: "sands", location: "noelle" }
    d = { ...a, slotKey: "goblet", location: "noelle" }
    e = { ...a, slotKey: "circlet", location: "noelle" }
    a.id = database.updateArt(a)
    b.id = database.updateArt(b)
    c.id = database.updateArt(c)
    d.id = database.updateArt(d)
    e.id = database.updateArt(e)
    abcde = {
      flower: a.id,
      plume: b.id,
      sands: c.id,
      goblet: d.id,
      circlet: e.id,
    }
    empty = Object.fromEntries(allSlotKeys.map(sk => [sk, ""])) as StrictDict<SlotKey, "">

    noelle = {
      characterKey: "noelle",
      equippedArtifacts: empty,
      levelKey: "lvl"
    }
    ningguang = {
      characterKey: "ningguang",
      equippedArtifacts: empty,
      levelKey: "lvl"
    }
    database.updateChar(noelle)
    database.updateChar(ningguang)
    database.setLocation(c.id, noelle.characterKey)
    database.setLocation(d.id, noelle.characterKey)
    database.setLocation(e.id, noelle.characterKey)
  })
  test(`Character.remove`, () => {
    database.removeChar("noelle")
    const noelleDB = database._getChar("noelle")
    expect(noelleDB).toBe(undefined)
    Object.values(abcde).forEach(id => expect(database._getArt(id)?.location).toBe(""))
  })
})
