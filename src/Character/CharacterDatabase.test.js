import CharacterDatabase from "./CharacterDatabase"

describe('Test CharacterDatabase', () => {
  const char_test1 = {
    characterKey: "test1",
    levelKey: "L1",
    equippedArtifacts: { "slot1": "art1", "slot2": "art2" }
  }
  const char_test2 = {
    characterKey: "test2",
    levelKey: "L1",
  }
  beforeEach(() => {
    localStorage.clear()
    const invalid = { characterKey: "invalid" }
    localStorage.setItem("char_test1", JSON.stringify(char_test1))
    localStorage.setItem("char_test2", JSON.stringify(char_test2))
    localStorage.setItem("character_invalid", JSON.stringify(invalid))
    CharacterDatabase.clearDatabase()
    CharacterDatabase.populateDatebaseFromLocalStorage()
  })
  afterEach(() => localStorage.clear())
  describe("populateDatebaseFromLocalStorage()", () => {
    test(`should populateDatebaseFromLocalStorage()`, () => {
      expect(CharacterDatabase.getCharacterKeyList()).toEqual(["test1", "test2"])
    })
  })
  describe('get()', () => {
    test('should get character', () => {
      expect(CharacterDatabase.get("test1")).toEqual(char_test1)
      expect(CharacterDatabase.get("test2")).toEqual(char_test2)
      expect(CharacterDatabase.get("invalid")).toEqual(null)
    })
  })

  describe("updateCharacter()", () => {
    test('should add New Character', () => {
      const characterKey = "newchar"
      const newChar = { characterKey, levelKey: "L1" }
      CharacterDatabase.updateCharacter(newChar)
      expect(CharacterDatabase.get(characterKey)).toEqual(newChar)
      expect(JSON.parse(localStorage.getItem(`char_${characterKey}`))).toEqual(newChar)
    })
    test('should update Existing Character', () => {
      const characterKey = "test1"
      const updateChar = { characterKey, levelKey: "L20" }
      CharacterDatabase.updateCharacter(updateChar)
      expect(CharacterDatabase.get(characterKey)).toEqual(updateChar)
      expect(JSON.parse(localStorage.getItem(`char_${characterKey}`))).toEqual(updateChar)
    })
  })
  describe('remove()', () => {
    test('should remove character', () => {
      const characterKey = "test1"
      CharacterDatabase.remove(characterKey)
      expect(CharacterDatabase.get(characterKey)).toBe(null)
      expect(JSON.parse(localStorage.getItem(`char_${characterKey}`))).toBe(null)
    })
  })
  describe('getArtifactIDFromSlot()', () => {
    test('should get', () => {
      expect(CharacterDatabase.getArtifactIDFromSlot("test1", "slot1")).toBe("art1")
      expect(CharacterDatabase.getArtifactIDFromSlot("test1", "slot2")).toBe("art2")
      expect(CharacterDatabase.getArtifactIDFromSlot("test2", "slot2")).toBe(null)
    })
  })
  describe('equipArtifact()', () => {
    test('should equip', () => {
      const art1 = { id: "art_1", slotKey: "slot1" }
      CharacterDatabase.equipArtifact("test1", art1)
      expect(CharacterDatabase.getArtifactIDFromSlot("test1", "slot1")).toBe("art_1")
      const artnew = { id: "art_23", slotKey: "slot2" }
      CharacterDatabase.equipArtifact("test2", artnew)
      expect(CharacterDatabase.getArtifactIDFromSlot("test2", "slot2")).toBe("art_23")
    })
  })
  describe('unequipArtifactOnSlot()', () => {
    test('should unequip', () => {
      CharacterDatabase.unequipArtifactOnSlot("test1", "slot1")
      expect(CharacterDatabase.getArtifactIDFromSlot("test1", "slot1")).toBe("")

      CharacterDatabase.unequipArtifactOnSlot("test2", "slot1")
      expect(CharacterDatabase.getArtifactIDFromSlot("test2", "slot1")).toBe(null)
    })
  })
  describe('equipArtifactBuild()', () => {
    test('should equip build', () => {
      const build = { slot1: "art1", slot2: "art2" }
      CharacterDatabase.equipArtifactBuild("test1", build)
      expect(CharacterDatabase.get("test1").equippedArtifacts).toEqual(build)
      CharacterDatabase.equipArtifactBuild("test2", build)
      expect(CharacterDatabase.get("test2").equippedArtifacts).toEqual(build)
    })
  })
})