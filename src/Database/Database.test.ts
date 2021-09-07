import { ICachedArtifact } from "../Types/artifact"
import { ICachedCharacter } from "../Types/character"
import { randomizeArtifact } from "../Util/ArtifactUtil"
import { deepClone, getArrLastElement } from "../Util/Util"
import { database, ArtCharDatabase } from "./Database"
import * as data1 from "./Database.db1.test.json"
import { dbStorage } from "./DBStorage"
import { importGO } from "./exim/go"
import { importGOOD, exportGOOD } from "./exim/good"
import { validateArtifact } from "./validation"

const baseAlbedo: ICachedCharacter = {
  key: "Albedo",
  equippedArtifacts: { flower: "", plume: "", sands: "", goblet: "", circlet: "" },
  level: 1, ascension: 0,
  hitMode: "hit",
  reactionMode: null,
  conditionalValues: {},
  baseStatOverrides: {},
  talent: {
    auto: 2, skill: 2, burst: 2,
  },
  infusionAura: "",
  constellation: 0,
  equippedWeapon: "",
} as const
const baseAmber: ICachedCharacter = {
  key: "Amber",
  equippedArtifacts: { flower: "", plume: "", sands: "", goblet: "", circlet: "" },
  level: 1, ascension: 0,
  hitMode: "hit",
  reactionMode: null,
  conditionalValues: {},
  baseStatOverrides: {},
  talent: {
    auto: 2, skill: 2, burst: 2,
  },
  infusionAura: "",
  constellation: 0,
  equippedWeapon: "",
} as const

describe("Database", () => {
  beforeEach(() => {
    dbStorage.clear()
    database.reloadStorage()
  })

  test("Can initialize from and empty storage", () => {
    new ArtCharDatabase(dbStorage)
  })
  test("Can clear database", () => {
    dbStorage.copyFrom(importGO(data1)!.storage)
    database.reloadStorage()

    // Not empty, yet
    expect(database.arts.data).not.toEqual({})
    expect(database.chars.data).not.toEqual({})
    expect(database.weapons.data).not.toEqual({})

    // Empty, now
    dbStorage.clear()
    database.reloadStorage()
    expect(database.arts.data).toEqual({})
    expect(database.chars.data).toEqual({})
  })
  test("Can import valid old storage (dbv5)", () => {
    dbStorage.copyFrom(importGO(data1)!.storage)
    database.reloadStorage()
    expect(database._getArts().length).toEqual(149)
    expect(database._getCharKeys().length).toEqual(2)
    expect(database.weapons.keys.length).toEqual(2)
  })
  test("Support roundtrip import-export", () => {
    // TODO: 
  })
  test("Does not crash from invalid storage", () => {
    function tryStorage(setup: (storage: Storage) => void, verify: (storage: Storage) => void = () => { }) {
      localStorage.clear()
      setup(localStorage)
      new ArtCharDatabase(dbStorage)
      verify(localStorage)
    }

    tryStorage(storage => {
      storage.char_x = "{ test: \"test\" }"
      storage.artifact_x = "{}"
    }, storage => {
      expect(storage.getItem("char_x")).toBeNull()
    })
    for (let i = 2; i < 5; i++) {
      tryStorage(storage => {
        storage.db_ver = `${i}`
        storage.char_x = "{ \"test\": \"test\" }"
        storage.artifact_x = "{}"
        expect(storage.getItem("char_x")).not.toBeNull()
      }, storage => {
        expect(storage.getItem("char_x")).toBeNull()
        expect(storage.getItem("artifact_x")).toBeNull()
      })
    }
    tryStorage(storage => {
      storage.char_x = "{ test: \"test\" }"
      storage.artifact_x = "{}"
      expect(storage.getItem("char_x")).not.toBeNull()
    }, storage => {
      expect(storage.getItem("char_x")).toBeNull()
      expect(storage.getItem("artifact_x")).toBeNull()
    })
  })
  test("Support basic operations", async () => {
    // Add Character and Artifact
    dbStorage.clear()
    database.reloadStorage()
    const Albedo = deepClone(baseAlbedo)
    const Amber = deepClone(baseAmber)
    const art1 = validateArtifact(await randomizeArtifact(), "artifact_123").artifact
    const art2 = validateArtifact(await randomizeArtifact(), "artifact_456").artifact
    art1.slotKey = "circlet"
    art2.slotKey = "circlet"
    Albedo.talent.auto = 4
    Albedo.equippedArtifacts.flower = "1234"
    art1.location = "Albedo"
    database.updateChar(Albedo)
    database.updateChar(Amber)
    art1.id = database.updateArt(art1)
    // Ignoring equipedArtifact data
    expect(database._getChar("Albedo")?.equippedArtifacts.flower).toEqual("")
    expect(database._getArt(art1.id)?.location).toEqual("")
    // But keep all other data
    Albedo.equippedArtifacts.flower = ""
    art1.location = ""
    expect(database._getChar("Albedo")).toEqual(Albedo)
    expect(database._getArt(art1.id)).toEqual(art1)

    // Setup callback
    const AlbedoCallback1 = jest.fn()
    const artifact1Callback1 = jest.fn()
    const AlbedoCallback1Cleanup = database.followChar("Albedo", AlbedoCallback1)
    /* const artifact1Callback1Cleanup = */ database.followArt(art1.id, artifact1Callback1)
    // Both should receive a callback for the current value
    expect(getArrLastElement(AlbedoCallback1.mock.calls)[0]).toEqual(Albedo)
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0]).toEqual(art1)

    // Set location
    database.setLocation(art1.id, "Albedo")
    expect(database._getArt(art1.id)?.location).toEqual("Albedo")
    expect(database._getChar("Albedo")?.equippedArtifacts[art1.slotKey]).toEqual(art1.id)
    // (Update later so that we're sure it's not referential)
    Albedo.equippedArtifacts[art1.slotKey] = art1.id
    art1.location = "Albedo"
    expect(database._getChar("Albedo")).toEqual(Albedo)
    expect(database._getArt(art1.id)).toEqual(art1)
    // And receive its callback
    expect(getArrLastElement(AlbedoCallback1.mock.calls)[0] as ICachedCharacter).toEqual(Albedo)
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact).toEqual(art1)

    // If we set another artifact to the same location
    art2.id = database.updateArt(art2)
    database.equipArtifacts("Albedo", { circlet: art2.id, flower: "", sands: "", goblet: "", plume: "" })
    // We should again receive the callbacks
    art1.location = ""
    expect((getArrLastElement(AlbedoCallback1.mock.calls)[0] as ICachedCharacter).equippedArtifacts).toEqual({ circlet: art2.id, flower: "", sands: "", goblet: "", plume: "" })
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact).toEqual(art1)
    // And art2 should have proper location
    art2.location = "Albedo"
    expect(database._getArt(art2.id)).toEqual(art2)

    // Now if we cancel the callback
    const lastCount = AlbedoCallback1.mock.calls.length
    AlbedoCallback1Cleanup?.()
    // We should no longer receive any new calls
    database.setLocation(art1.id, "Amber")
    expect(AlbedoCallback1.mock.calls.length).toEqual(lastCount)

    // Right now, we would have (Amber, art1) and (Albedo, art2), so if we set location of either
    database.setLocation(art2.id, "Amber")
    // art1 and art2 should swap locations, while, of course retaining other values
    Albedo.equippedArtifacts.circlet = art1.id
    Amber.equippedArtifacts.circlet = art2.id
    art1.location = "Albedo"
    art2.location = "Amber"
    expect(database._getChar("Amber")).toEqual(Amber)
    expect(database._getChar("Albedo")).toEqual(Albedo)
    expect(database._getArt(art1.id)).toEqual(art1)
    expect(database._getArt(art2.id)).toEqual(art2)

    // If we delete equiped artifact,
    database.removeArt(art1.id)
    // It should properly handle other char's info
    expect(database._getChar("Albedo")?.equippedArtifacts.circlet).toEqual("")
    // And transmitted a proper info
    expect(database._getChar("Albedo")).not.toEqual(Albedo)
    Albedo.equippedArtifacts.circlet = ""
    expect(database._getChar("Albedo")).toEqual(Albedo)
    expect(database._getArt(art1.id)).toBeUndefined()
    // It should also trigger callback on the removing artifact
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact | undefined).toBeUndefined

    // And if we remove a char
    database.removeChar("Amber")
    // Artifact would follow
    expect(database._getArt(art2.id)?.location).toEqual("")
    expect(database._getChar("Amber")).toBeUndefined()

    // Recap, we should now have unequiped art2 and Albedo

    // BTW, setting locks should work
    database.excludeArtifact(art2.id)
    expect(database._getArt(art2.id)?.exclude).toEqual(true)
    database.excludeArtifact(art2.id, false)
    expect(database._getArt(art2.id)?.exclude).toEqual(false)
  })
})
