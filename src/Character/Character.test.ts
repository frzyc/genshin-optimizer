import CharacterDatabase from "../Database/CharacterDatabase"
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
    const weaponSheet = await WeaponSheet.get(character.weapon.key)
    expect(character).toBeTruthy()
    expect(characterSheet).toBeInstanceOf(CharacterSheet)
    expect(weaponSheet).toBeInstanceOf(WeaponSheet)
    if (!characterSheet || !weaponSheet) return
    const initialStats = Character.createInitialStats(character, characterSheet, weaponSheet)
    const keys = characterSheet.getDisplayStatKeys(initialStats)
    expect(keys).toHaveProperty("auto")
  })
})