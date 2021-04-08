import Artifact from "./Artifact";
import { artifactReducer, initialArtifact } from "./ArtifactEditor";
describe('artifactReducer', () => {
  let initial;
  beforeEach(() => initial = initialArtifact())
  beforeAll(() => Artifact.getDataImport())

  test('should handle setKey', () => {
    initial.level = 99
    let newState = artifactReducer(initial, { setKey: "GladiatorsFinale" })
    expect(newState).toEqual({ ...initial, setKey: "GladiatorsFinale", numStars: 5, level: 20, mainStatKey: "hp", slotKey: "flower" })
    //should change mainStatKey & slotKey if invalid for new setKey
    newState = artifactReducer(initial, { setKey: "PrayersForWisdom" })
    expect(newState).toEqual({ ...initial, setKey: "PrayersForWisdom", numStars: 4, level: 16, mainStatKey: "hp_", slotKey: "circlet" })
  })
  test('should handle numStars', () => {
    initial.setKey = "GladiatorsFinale"
    let newState = artifactReducer(initial, { numStars: 5 })
    expect(newState.numStars).toBe(5)
    initial.level = 20
    newState = artifactReducer(initial, { numStars: 4 })
    expect(newState.numStars).toBe(4)
    expect(newState.level).toBe(16)
    newState = artifactReducer(initial, { numStars: 3 })//invalid for this set
    expect(newState.numStars).toBe(5)
  })
  test('should handle level', () => {
    initial.setKey = "GladiatorsFinale"
    initial.numStars = 4
    const newState = artifactReducer(initial, { level: 13 })
    expect(newState).toEqual({ ...initial, level: 13 })
  })
  test('should handle slotKey', () => {
    initial.setKey = "GladiatorsFinale"
    initial.mainStatKey = "hp"
    let newState = artifactReducer(initial, { slotKey: "plume" })
    expect(newState).toEqual({ ...initial, slotKey: "plume", mainStatKey: "atk" })

    //should handle invalid slotKey
    initial.setKey = "PrayersForWisdom"
    newState = artifactReducer(initial, { slotKey: "plume" })
    expect(newState).toEqual({ ...initial, slotKey: "circlet", mainStatKey: "hp_" })
  })
  test('should handle mainStatKey', () => {
    initial.setKey = "GladiatorsFinale"
    initial.slotKey = "sands"
    initial.mainStatKey = "hp_"
    let newState = artifactReducer(initial, { mainStatKey: "def_" })
    expect(newState).toEqual({ ...initial, mainStatKey: "def_" })
    //try to add a  mainStatKey with a substat having the same key, substat should be erased
    initial.substats[0].key = "def_"
    initial.substats[0].value = 999
    newState = artifactReducer(initial, { mainStatKey: "def_" })
    expect(newState).toEqual({ ...initial, mainStatKey: "def_", substats: initialArtifact().substats })

    //will force take a mainStatKey when its flower or plume
    initial.slotKey = "flower"
    initial.mainStatKey = ""
    initial.substats[0].key = "hp"
    initial.substats[0].value = 999
    newState = artifactReducer(initial, { mainStatKey: "def_" })
    expect(newState).toEqual({ ...initial, mainStatKey: "hp", substats: initialArtifact().substats })

  })
  test('should handle substats', () => {
    let newState = artifactReducer(initial, { type: "substat", key: "def", value: 999, index: 0 })
    expect(newState.substats[0]).toEqual({ key: "def", value: 999 })

    //wont assign if mainstat has the key
    initial = initialArtifact()
    initial.mainStatKey = "hp"
    newState = artifactReducer(initial, { type: "substat", key: "hp", value: 999, index: 1 })
    expect(newState.substats[1]).toEqual({ key: "", value: 0 })

    //wont assign substat if another substat has the key
    initial = initialArtifact()
    initial.substats[0].key = "hp"
    initial.substats[0].value = 999
    newState = artifactReducer(initial, { type: "substat", key: "hp", value: 999, index: 1 })
    expect(newState.substats[0]).toEqual({ key: "hp", value: 999 })
    expect(newState.substats[1]).toEqual({ key: "", value: 0 })
  })
  test("should reset", () => {
    initial.setKey = "GladiatorsFinale"
    initial.level = 20
    initial.numStars = 5
    const newState = artifactReducer(initial, { type: "reset" })
    expect(newState).toEqual(initialArtifact())
  })
  test('should overwrite', () => {
    const overwrite = { test: "test" }
    const newState = artifactReducer(initial, { type: "overwrite", artifact: overwrite })
    expect(newState).toBe(overwrite)
  })
})

