import { IArtifact } from "../Types/artifact"
import { ICharacter } from "../Types/character"
import { randomizeArtifact } from "../Util/ArtifactUtil"
import { deepClone, getArrLastElement } from "../Util/Util"
import { database, Database } from "./Database"
import * as data1 from "./Database.db1.test.json"

const baseAlbedo: ICharacter = {
  characterKey: "albedo",
  equippedArtifacts: { flower: "", plume: "", sands: "", goblet: "", circlet: "" },
  level: 1, ascension: 0,
  hitMode: "hit",
  reactionMode: null,
  conditionalValues: {},
  baseStatOverrides: {},
  weapon: {
    key: "DullBlade",
    level: 10,
    refineIndex: 1,
    ascension: 0,
  },
  talentLevelKeys: {
    auto: 1, skill: 1, burst: 1,
  },
  infusionAura: "",
  constellation: 0
} as const
const baseAmber: ICharacter = {
  characterKey: "amber",
  equippedArtifacts: { flower: "", plume: "", sands: "", goblet: "", circlet: "" },
  level: 1, ascension: 0,
  hitMode: "hit",
  reactionMode: null,
  conditionalValues: {},
  baseStatOverrides: {},
  weapon: {
    key: "SkywardHarp",
    level: 10,
    refineIndex: 1,
    ascension: 0,
  },
  talentLevelKeys: {
    auto: 1, skill: 1, burst: 1,
  },
  infusionAura: "",
  constellation: 0
} as const

describe("Database", () => {
  beforeEach(() => {
    database.clear()
    localStorage.clear()
  })

  test("Can initialize from and empty storage", () => {
    // @ts-ignore use private constructor
    new Database(localStorage)
  })
  test("Can clear database", () => {
    database.importStorage(data1 as any)

    // Not empty, yet
    expect(database.arts.data).not.toEqual({})
    expect(database.chars.data).not.toEqual({})

    // Empty, now
    database.clear()
    expect(database.arts.data).toEqual({})
    expect(database.chars.data).toEqual({})
  })
  test("Can import valid old storage (dbv5)", () => {
    database.importStorage(data1 as any)
    expect(database._getArts().length).toEqual(149)
    expect(database._getCharKeys().length).toEqual(2)
  })
  test("Support roundtrip import-export", () => {
    database.importStorage(data1 as any)
    const arts = database.arts.data, chars = database.chars.data
    const exported = JSON.stringify(database.exportStorage())

    // Clear, just to be sure there's no lingering data since we're using singleton
    database.clear()
    expect(database.arts.data).toEqual({})
    expect(database.chars.data).toEqual({})

    database.importStorage(JSON.parse(exported) as any)
    expect(database.arts.data).toEqual(arts)
    expect(database.chars.data).toEqual(chars)
  })
  test("Does not crash from invalid storage", () => {
    function tryStorage(setup: (storage: Storage) => void, verify: (storage: Storage) => void = () => { }) {
      localStorage.clear()
      // @ts-ignore use private constructor
      new Database(localStorage)
      verify(localStorage)
    }

    tryStorage(storage => {
      storage.char_x = "{ test: \"test\" }"
      storage.art_x = "{}"
    }, storage => {
      expect(localStorage.getItem("char_x")).toBeNull()
    })
    for (let i = 2; i < 5; i++) {
      tryStorage(storage => {
        storage.db_ver = `${i}`
        storage.char_x = "{ test: \"test\" }"
        storage.art_x = "{}"
        expect(storage.getItem("char_x")).not.toBeNull()
      }, storage => {
        expect(storage.getItem("char_x")).toBeNull()
        expect(storage.getItem("art_x")).toBeNull()
      })
    }
    tryStorage(storage => {
      storage.char_x = "{ test: \"test\" }"
      storage.art_x = "{}"
      expect(storage.getItem("char_x")).not.toBeNull()
    }, storage => {
      expect(storage.getItem("char_x")).toBeNull()
      expect(storage.getItem("art_x")).toBeNull()
    })
  })
  test("Support basic operations", async () => {
    // Add Character and Artifact
    database.clear()
    const albedo = deepClone(baseAlbedo)
    const amber = deepClone(baseAmber)
    const art1 = await randomizeArtifact()
    const art2 = await randomizeArtifact()
    art1.slotKey = "circlet"
    art2.slotKey = "circlet"
    albedo.talentLevelKeys.auto = 3
    albedo.equippedArtifacts.flower = "1234"
    art1.location = "albedo"
    database.updateChar(albedo)
    database.updateChar(amber)
    art1.id = database.updateArt(art1)
    // Ignoring equipedArtifact data
    expect(database._getChar("albedo")?.equippedArtifacts.flower).toEqual("")
    expect(database._getArt(art1.id)?.location).toEqual("")
    // But keep all other data
    albedo.equippedArtifacts.flower = ""
    art1.location = ""
    expect(database._getChar("albedo")).toEqual(albedo)
    expect(database._getArt(art1.id)).toEqual(art1)

    // Setup callback
    const albedoCallback1 = jest.fn()
    const artifact1Callback1 = jest.fn()
    const albedoCallback1Cleanup = database.followChar("albedo", albedoCallback1)
    const artifact1Callback1Cleanup = database.followArt(art1.id, artifact1Callback1)
    // Both should receive a callback for the current value
    expect(getArrLastElement(albedoCallback1.mock.calls)[0]).toEqual(albedo)
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0]).toEqual(art1)

    // Set location
    database.setLocation(art1.id, "albedo")
    expect(database._getArt(art1.id)?.location).toEqual("albedo")
    expect(database._getChar("albedo")?.equippedArtifacts[art1.slotKey]).toEqual(art1.id)
    // (Update later so that we're sure it's not referential)
    albedo.equippedArtifacts[art1.slotKey] = art1.id
    art1.location = "albedo"
    expect(database._getChar("albedo")).toEqual(albedo)
    expect(database._getArt(art1.id)).toEqual(art1)
    // And receive its callback
    expect(getArrLastElement(albedoCallback1.mock.calls)[0] as ICharacter).toEqual(albedo)
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as IArtifact).toEqual(art1)

    // If we set another artifact to the same location
    art2.id = database.updateArt(art2)
    database.equipArtifacts("albedo", { circlet: art2.id, flower: "", sands: "", goblet: "", plume: "" })
    // We should again receive the callbacks
    art1.location = ""
    expect((getArrLastElement(albedoCallback1.mock.calls)[0] as ICharacter).equippedArtifacts).toEqual({ circlet: art2.id, flower: "", sands: "", goblet: "", plume: "" })
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as IArtifact).toEqual(art1)
    // And art2 should have proper location
    art2.location = "albedo"
    expect(database._getArt(art2.id)).toEqual(art2)

    // Now if we cancel the callback
    const lastCount = albedoCallback1.mock.calls.length
    albedoCallback1Cleanup?.()
    // We should no longer receive any new calls
    database.setLocation(art1.id, "amber")
    expect(albedoCallback1.mock.calls.length).toEqual(lastCount)

    // Right now, we would have (amber, art1) and (albedo, art2), so if we set location of either
    database.setLocation(art2.id, "amber")
    // art1 and art2 should swap locations, while, of course retaining other values
    albedo.equippedArtifacts.circlet = art1.id
    amber.equippedArtifacts.circlet = art2.id
    art1.location = "albedo"
    art2.location = "amber"
    expect(database._getChar("amber")).toEqual(amber)
    expect(database._getChar("albedo")).toEqual(albedo)
    expect(database._getArt(art1.id)).toEqual(art1)
    expect(database._getArt(art2.id)).toEqual(art2)

    // If we delete equiped artifact,
    database.removeArt(art1.id)
    // It should properly handle other char's info
    expect(database._getChar("albedo")?.equippedArtifacts.circlet).toEqual("")
    // And transmitted a proper info
    expect(database._getChar("albedo")).not.toEqual(albedo)
    albedo.equippedArtifacts.circlet = ""
    expect(database._getChar("albedo")).toEqual(albedo)
    expect(database._getArt(art1.id)).toBeUndefined()
    // It should also trigger callback on the removing artifact
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as IArtifact | undefined).toBeUndefined

    // And if we remove a char
    database.removeChar("amber")
    // Artifact would follow
    expect(database._getArt(art2.id)?.location).toEqual("")
    expect(database._getChar("amber")).toBeUndefined()

    // Recap, we should now have unequiped art2 and albedo

    // BTW, setting locks should work
    database.lockArtifact(art2.id)
    expect(database._getArt(art2.id)?.lock).toEqual(true)
    database.lockArtifact(art2.id, false)
    expect(database._getArt(art2.id)?.lock).toEqual(false)
  })
})
