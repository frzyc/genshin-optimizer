import { initialCharacter } from "../ReactHooks/useCharSelectionCallback"
import { ICachedArtifact } from "../Types/artifact"
import { ICachedCharacter } from "../Types/character"
import { randomizeArtifact } from "../Util/ArtifactUtil"
import { getArrLastElement } from "../Util/Util"
import { defaultInitialWeapon } from "../Util/WeaponUtil"
import { ArtCharDatabase } from "./Database"
import { DBLocalStorage, SandboxStorage } from "./DBStorage"
import { exportGOOD } from "./exports/good"
import { importGOOD } from "./imports/good"
import { validateArtifact } from "./imports/validate"

const dbStorage = new DBLocalStorage(localStorage)
let database = new ArtCharDatabase(dbStorage)

describe("Database", () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbStorage)
  })

  test("Can clear database", () => {
    // TODO
  })
  test("Can import valid old storage (dbv5)", () => {
    // TODO
  })
  test("Support roundtrip import-export", async () => {
    const albedo = initialCharacter("Albedo"), amber = initialCharacter("Amber")
    const albedoWeapon = defaultInitialWeapon("sword"), amberWeapon = defaultInitialWeapon("bow")

    const art1 = validateArtifact(await randomizeArtifact({ slotKey: "circlet" }), "").artifact, art2 = validateArtifact(await randomizeArtifact(), "").artifact
    albedo.talent.auto = 4

    albedo.equippedWeapon = database.weapons.new(albedoWeapon)
    amber.equippedWeapon = database.weapons.new(amberWeapon)
    database.chars.set(albedo.key, albedo)
    database.chars.set(amber.key, amber)
    database.weapons.set(albedo.equippedWeapon, { location: "Albedo" })
    database.weapons.set(amber.equippedWeapon, { location: "Amber" })

    art1.id = database.arts.new(art1)
    art2.id = database.arts.new(art2)
    database.arts.set(art1.id, { location: "Albedo" })
    art1.location = "Albedo"

    const { storage } = importGOOD(exportGOOD(database.storage), database) ?? { storage: new SandboxStorage() }
    const result = new ArtCharDatabase(storage)

    albedo.equippedArtifacts.circlet = result.chars.get("Albedo")!.equippedArtifacts.circlet
    art1.id = albedo.equippedArtifacts.circlet
    albedo.equippedWeapon = result.chars.get("Albedo")!.equippedWeapon
    amber.equippedWeapon = result.chars.get("Amber")!.equippedWeapon

    expect(result.chars.keys).toEqual(expect.arrayContaining(["Albedo", "Amber"]))
    expect(result.chars.get("Albedo")).toEqual(albedo)
    expect(result.chars.get("Amber")).toEqual(amber)
    expect(result.arts.get(art1.id)).toEqual(art1)
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

    const art1 = validateArtifact(await randomizeArtifact({ slotKey: "circlet" }), "").artifact, art2 = validateArtifact(await randomizeArtifact({ slotKey: "circlet" }), "").artifact
    albedo.talent.auto = 4

    // Sabotage
    art1.location = "Albedo"
    albedo.equippedArtifacts.flower = "1234"

    const albedoWeaponId = database.weapons.new(albedoWeapon)
    const amberWeaponId = database.weapons.new(amberWeapon)
    database.chars.set(albedo.key, albedo)
    database.chars.set(amber.key, amber)
    database.weapons.set(albedoWeaponId, { location: "Albedo" })
    database.weapons.set(amberWeaponId, { location: "Amber" })
    albedo.equippedWeapon = albedoWeaponId
    amber.equippedWeapon = amberWeaponId

    art1.id = database.arts.new(art1)
    art2.id = database.arts.new(art2)
    database.chars.set(amber.key, amber)
    database.arts.new(art1)
    database.chars.set(albedo.key, albedo)
    database.chars.set(amber.key, amber)

    // Ignoring equipedArtifact data
    expect(database.chars.get("Albedo")?.equippedArtifacts.flower).toEqual("")
    expect(database.arts.get(art1.id)?.location).toEqual("")
    // But keep all other data
    albedo.equippedArtifacts.flower = ""
    art1.location = ""
    // expect(removeCharacterCache(database.chars.get("Albedo")!)).toEqual(removeCharacterCache(albedo)) // TODO:
    expect(database.arts.get(art1.id)).toEqual(validateArtifact(art1, art1.id).artifact)

    // Setup callback
    const AlbedoCallback1 = jest.fn()
    const artifact1Callback1 = jest.fn()
    const AlbedoCallback1Cleanup = database.chars.follow("Albedo", AlbedoCallback1)
    /* const artifact1Callback1Cleanup = */ database.arts.follow(art1.id, artifact1Callback1)

    // Set location
    database.arts.set(art1.id, { location: "Albedo" })
    expect(database.arts.get(art1.id)?.location).toEqual("Albedo")
    expect(database.chars.get("Albedo")?.equippedArtifacts[art1.slotKey]).toEqual(art1.id)
    // (Update later so that we're sure it's not referential)
    albedo.equippedArtifacts[art1.slotKey] = art1.id
    art1.location = "Albedo"
    expect(database.chars.get("Albedo")).toEqual(albedo)
    expect(database.arts.get(art1.id)).toEqual(art1)
    // And receive its callback
    expect(getArrLastElement(AlbedoCallback1.mock.calls)[0] as ICachedCharacter).toEqual(albedo)
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact).toEqual(art1)

    // If we set another artifact to the same location
    database.arts.set(art2.id, art2)
    database.chars.equipArtifacts("Albedo", { circlet: art2.id, flower: "", sands: "", goblet: "", plume: "" })
    // We should again receive the callbacks
    art1.location = ""
    expect((getArrLastElement(AlbedoCallback1.mock.calls)[0] as ICachedCharacter).equippedArtifacts).toEqual({ circlet: art2.id, flower: "", sands: "", goblet: "", plume: "" })
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact).toEqual(art1)
    // And art2 should have proper location
    art2.location = "Albedo"
    expect(database.arts.get(art2.id)).toEqual(art2)

    // Now if we cancel the callback
    const lastCount = AlbedoCallback1.mock.calls.length
    AlbedoCallback1Cleanup?.()
    // We should no longer receive any new calls
    database.arts.set(art1.id, { location: "Amber" })
    expect(AlbedoCallback1.mock.calls.length).toEqual(lastCount)

    // Right now, we would have (Amber, art1) and (Albedo, art2), so if we set location of either
    database.arts.set(art2.id, { location: "Amber" })
    // art1 and art2 should swap locations, while, of course retaining other values
    albedo.equippedArtifacts.circlet = art1.id
    amber.equippedArtifacts.circlet = art2.id
    art1.location = "Albedo"
    art2.location = "Amber"
    expect(database.chars.get("Amber")).toEqual(amber)
    expect(database.chars.get("Albedo")).toEqual(albedo)
    expect(database.arts.get(art1.id)).toEqual(art1)
    expect(database.arts.get(art2.id)).toEqual(art2)

    // If we delete equiped artifact,
    database.arts.remove(art1.id)
    // It should properly handle other char's info
    expect(database.chars.get("Albedo")?.equippedArtifacts.circlet).toEqual("")
    // And transmitted a proper info
    expect(database.chars.get("Albedo")).not.toEqual(albedo)
    albedo.equippedArtifacts.circlet = ""
    expect(database.chars.get("Albedo")).toEqual(albedo)
    expect(database.arts.get(art1.id)).toBeUndefined()
    // It should also trigger callback on the removing artifact
    expect(getArrLastElement(artifact1Callback1.mock.calls)[0] as ICachedArtifact | undefined).toBeUndefined

    // And if we remove a char
    database.chars.remove("Amber")
    // Artifact would follow
    expect(database.arts.get(art2.id)?.location).toEqual("")
    expect(database.chars.get("Amber")).toBeUndefined()

    // Recap, we should now have unequiped art2 and Albedo

    // BTW, setting locks should work
    database.arts.set(art2.id, { exclude: true })
    expect(database.arts.get(art2.id)?.exclude).toEqual(true)
    database.arts.set(art2.id, { exclude: false })
    expect(database.arts.get(art2.id)?.exclude).toEqual(false)
  })
})
