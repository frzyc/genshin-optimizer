import CharacterDatabase from "../Database/CharacterDatabase"
import Character from "./Character"

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

  beforeEach(() => CharacterDatabase.update({ characterKey, levelKey: "L60A" }))
  afterEach(() => localStorage.clear())
  test('should get statKeys for characters with finished talent page', () => {
    const keys = Character.getDisplayStatKeys(CharacterDatabase.get(characterKey))
    expect(keys).toHaveProperty("auto")
  })
  test('should get statKeys for characters with unfinished talent page', () => {

  })
})