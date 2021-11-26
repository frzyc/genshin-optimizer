import { initialCharacter } from "../Character/CharacterUtil"
import { ICachedArtifact } from "../Types/artifact"
import { ICachedCharacter } from "../Types/character"
import { CharacterKey, WeaponTypeKey } from "../Types/consts"
import { randomizeArtifact } from "../Util/ArtifactUtil"
import { deepClone, getArrLastElement } from "../Util/Util"
import { defaultInitialWeapon, initialWeapon } from "../Weapon/WeaponUtil"
import { database, ArtCharDatabase } from "./Database"
import * as data1 from "./Database.db1.test.json"
import { dbStorage, SandboxStorage } from "./DBStorage"
import { importGO } from "./exim/go"
import { importGOOD, exportGOOD } from "./exim/good"
import { removeCharacterCache, validateArtifact, validateCharacter } from "./validation"

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
  test("Support roundtrip import-export", async () => {
    const albedo = initialCharacter("Albedo"), amber = initialCharacter("Amber")
    const albedoWeapon = defaultInitialWeapon("sword"), amberWeapon = defaultInitialWeapon("bow")

    const art1 = validateArtifact(await randomizeArtifact(), "").artifact, art2 = validateArtifact(await randomizeArtifact(), "").artifact
    art1.slotKey = "circlet"
    albedo.talent.auto = 4

    albedo.equippedWeapon = database.createWeapon(albedoWeapon)
    amber.equippedWeapon = database.createWeapon(amberWeapon)
    database.updateChar(albedo)
    database.updateChar(amber)
    database.setWeaponLocation(albedo.equippedWeapon, "Albedo")
    database.setWeaponLocation(amber.equippedWeapon, "Amber")

    art1.id = database.createArt(art1)
    art2.id = database.createArt(art2)
    database.setArtLocation(art1.id, "Albedo")
    art1.location = "Albedo"

    const { storage } = importGOOD(exportGOOD(database.storage), database) ?? { storage: new SandboxStorage() }
    const result = new ArtCharDatabase(storage)

    albedo.equippedArtifacts.circlet = result._getChar("Albedo")!.equippedArtifacts.circlet
    art1.id = albedo.equippedArtifacts.circlet
    albedo.equippedWeapon = result._getChar("Albedo")!.equippedWeapon
    amber.equippedWeapon = result._getChar("Amber")!.equippedWeapon

    expect(result.chars.keys).toEqual(expect.arrayContaining(["Albedo", "Amber"]))
    expect(result._getChar("Albedo")).toEqual(albedo)
    expect(result._getChar("Amber")).toEqual(amber)
    expect(result._getArt(art1.id)).toEqual(art1)
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
    const albedo = initialCharacter("Albedo"), amber = initialCharacter("Amber")
    const albedoWeapon = defaultInitialWeapon("sword"), amberWeapon = defaultInitialWeapon("bow")

    const art1 = validateArtifact(await randomizeArtifact(), "").artifact, art2 = validateArtifact(await randomizeArtifact(), "").artifact
    art1.slotKey = "circlet"
    art2.slotKey = "circlet"
    albedo.talent.auto = 4

    // Sabotage
    art1.location = "Albedo"
    albedo.equippedArtifacts.flower = "1234"

    const albedoWeaponId = database.createWeapon(albedoWeapon)
    const amberWeaponId = database.createWeapon(amberWeapon)
    database.updateChar(albedo)
    database.updateChar(amber)
    database.setWeaponLocation(albedoWeaponId, "Albedo")
    database.setWeaponLocation(amberWeaponId, "Amber")
    albedo.equippedWeapon = albedoWeaponId
    amber.equippedWeapon = amberWeaponId

    art1.id = database.createArt(art1)
    art2.id = database.createArt(art2)
    database.updateChar(amber)
    database.createArt(art1)
    database.updateChar(albedo)
    database.updateChar(amber)

    // Ignoring equipedArtifact data
    expect(database._getChar("Albedo")?.equippedArtifacts.flower).toEqual("")
    expect(database._getArt(art1.id)?.location).toEqual("")
    // But keep all other data
    albedo.equippedArtifacts.flower = ""
    art1.location = ""
    expect(removeCharacterCache(database._getChar("Albedo")!)).toEqual(removeCharacterCache(albedo))
    expect(database._getArt(art1.id)).toEqual(validateArtifact(art1, art1.id).artifact)

    // Setup callback
    const AlbedoCallback1 = jest.fn()
    const artifact1Callback1 = jest.fn()
    const AlbedoCallback1Cleanup = database.followChar("Albedo", AlbedoCallback1)
    /* const artifact1Callback1Cleanup = */ database.followArt(art1.id, artifact1Callback1)

    // Set location
    database.setArtLocation(art1.id, "Albedo")
    expect(database._getArt(art1.id)?.location).toEqual("Albedo")
    expect(database._getChar("Albedo")?.equippedArtifacts[art1.slotKey]).toEqual(art1.id)
    // (Update later so that we're sure it's not referential)
    albedo.equippedArtifacts[art1.slotKey] = art1.id
    art1.location = "Albedo"
    expect(database._getChar("Albedo")).toEqual(albedo)
    expect(database._getArt(art1.id)).toEqual(art1)
    // And receive its callback
    expect(getArrLastElement(AlbedoCallback1.mock.calls)[0] as ICachedCharacter).toEqual(albedo)
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact).toEqual(art1)

    // If we set another artifact to the same location
    database.updateArt(art2, art2.id)
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
    database.setArtLocation(art1.id, "Amber")
    expect(AlbedoCallback1.mock.calls.length).toEqual(lastCount)

    // Right now, we would have (Amber, art1) and (Albedo, art2), so if we set location of either
    database.setArtLocation(art2.id, "Amber")
    // art1 and art2 should swap locations, while, of course retaining other values
    albedo.equippedArtifacts.circlet = art1.id
    amber.equippedArtifacts.circlet = art2.id
    art1.location = "Albedo"
    art2.location = "Amber"
    expect(database._getChar("Amber")).toEqual(amber)
    expect(database._getChar("Albedo")).toEqual(albedo)
    expect(database._getArt(art1.id)).toEqual(art1)
    expect(database._getArt(art2.id)).toEqual(art2)

    // If we delete equiped artifact,
    database.removeArt(art1.id)
    // It should properly handle other char's info
    expect(database._getChar("Albedo")?.equippedArtifacts.circlet).toEqual("")
    // And transmitted a proper info
    expect(database._getChar("Albedo")).not.toEqual(albedo)
    albedo.equippedArtifacts.circlet = ""
    expect(database._getChar("Albedo")).toEqual(albedo)
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
    database.updateArt({ exclude: true }, art2.id)
    expect(database._getArt(art2.id)?.exclude).toEqual(true)
    database.updateArt({ exclude: false }, art2.id)
    expect(database._getArt(art2.id)?.exclude).toEqual(false)
  })
})
