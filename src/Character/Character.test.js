import { saveToLocalStorage } from "../Util/Util"
import Character from "./Character"
import CharacterDatabase from "./CharacterDatabase"

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
const character = { characterKey: "noelle", hitMode: "avgHit" }
describe('Character.getTalentStatKey()', () => {
  test('should generate skill keys', () => {
    expect(Character.getTalentStatKey("skill", character)).toBe("geo_skill_avgHit")

  })
  test('should generate infusion', () => {
    expect(Character.getTalentStatKey("normal", character)).toBe("physical_normal_avgHit")
    expect(Character.getTalentStatKey("normal", { ...character, autoInfused: true })).toBe("geo_normal_avgHit")
  })

  test('should override element', () => {
    expect(Character.getTalentStatKey("normal", character, true)).toBe("geo_normal_avgHit")
    expect(Character.getTalentStatKey("normal", { ...character, autoInfused: true }, true)).toBe("geo_normal_avgHit")
  })
  test('should do elemental', () => {
    expect(Character.getTalentStatKey("pyro", character)).toBe("pyro_elemental_avgHit")
    expect(Character.getTalentStatKey("elemental", character)).toBe("geo_elemental_avgHit")
  })
  test('should do amp.reactions', () => {
    //normal without infusion
    expect(Character.getTalentStatKey("normal", { ...character, reactionMode: "pyro_melt" })).toBe("physical_normal_avgHit")
    //normal with infusion
    expect(Character.getTalentStatKey("normal", { ...character, reactionMode: "pyro_melt", autoInfused: true })).toBe("pyro_melt_normal_avgHit")
    //normal with override
    expect(Character.getTalentStatKey("normal", { ...character, reactionMode: "pyro_melt" }, true)).toBe("pyro_melt_normal_avgHit")
    //skill
    expect(Character.getTalentStatKey("skill", { ...character, reactionMode: "pyro_melt" })).toBe("pyro_melt_skill_avgHit")
    //elemental
    expect(Character.getTalentStatKey("elemental", { ...character, reactionMode: "pyro_melt" })).toBe("pyro_melt_elemental_avgHit")
  })
})

describe('Character.getDisplayStatKeys()', () => {
  const characterKey = "noelle"

  beforeEach(() => CharacterDatabase.updateCharacter({ characterKey, levelKey: "L60A" }))
  afterEach(() => localStorage.clear())
  test('should get statKeys for characters with finished talent page', () => {
    const keys = Character.getDisplayStatKeys(characterKey)
    expect(keys).toHaveProperty("auto")
  })
  test('should get statKeys for characters with unfinished talent page', () => {

  })
})