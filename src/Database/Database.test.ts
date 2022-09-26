import { initialCharacter } from "../ReactHooks/useCharSelectionCallback"
import { CharacterKey } from "../Types/consts"
import { randomizeArtifact } from "../Util/ArtifactUtil"
import { defaultInitialWeapon, initialWeapon } from "../Util/WeaponUtil"
import { cachedArtifact } from "./Data/ArtifactData"
import { ArtCharDatabase } from "./Database"
import { DBLocalStorage, SandboxStorage } from "./DBStorage"
import { IGOOD } from "./exim"
import { exportGOOD } from "./exports/good"
import { importGOOD } from "./imports/good"

const dbStorage = new DBLocalStorage(localStorage)
let database = new ArtCharDatabase(dbStorage)

describe("Database", () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbStorage)
  })

  test("Support roundtrip import-export", async () => {
    let albedo = initialCharacter("Albedo"), amber = initialCharacter("Amber")
    const albedoWeapon = defaultInitialWeapon("sword"), amberWeapon = defaultInitialWeapon("bow")

    const art1 = await randomizeArtifact({ slotKey: "circlet" }),
      art2 = await randomizeArtifact()
    albedo.talent.auto = 4
    art1.location = "Albedo"
    albedoWeapon.location = "Albedo"

    database.chars.set(albedo.key, albedo)
    database.chars.set(amber.key, amber)

    database.weapons.new(albedoWeapon)
    const amberWeaponid = database.weapons.new(amberWeapon)

    database.arts.new(art1)
    const art2id = database.arts.new(art2)
    database.arts.set(art2id, { location: "Amber" })
    database.weapons.set(amberWeaponid, { location: "Amber" })

    const newDB = new ArtCharDatabase(new SandboxStorage())
    importGOOD(exportGOOD(database.storage), newDB, false, false)!
    expect(database.storage.entries.filter(([k]) => k.startsWith("weapon_") || k.startsWith("character_") || k.startsWith("artifact_")))
      .toEqual(newDB.storage.entries.filter(([k]) => k.startsWith("weapon_") || k.startsWith("character_") || k.startsWith("artifact_")))
    expect(database.chars.values).toEqual(newDB.chars.values)
    expect(database.weapons.values).toEqual(newDB.weapons.values)
    expect(database.arts.values).toEqual(newDB.arts.values)
    // Can't check IcharacterCache because equipped can have differing id
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
  test("Ensure Equipment", async () => {
    const newKeys: CharacterKey[] = []
    const unfollow = database.chars.followAny((k, reason, value) => reason === "new" && newKeys.push(k))
    database.arts.new({ ...await randomizeArtifact(), location: "Amber" })
    expect(database.chars.get("Amber")).toBeTruthy()
    expect(database.weapons.get(database.chars.get("Amber")!.equippedWeapon)).toBeTruthy()
    expect(newKeys).toEqual(["Amber"])
    const weaponid = database.weapons.new({ ...defaultInitialWeapon("sword") })
    database.weapons.set(weaponid, { location: "Albedo" })
    expect(database.chars.get("Albedo")).toBeTruthy()
    expect(database.chars.get("Albedo")!.equippedWeapon).toEqual(weaponid)
    expect(newKeys).toEqual(["Amber", "Albedo"])
    unfollow()
  })

  test("Equip swap", async () => {
    database.chars.set("Albedo", initialCharacter("Albedo"))
    database.weapons.new({ ...defaultInitialWeapon("sword"), location: "Albedo" })

    const art1 = await randomizeArtifact({ slotKey: "circlet" })
    art1.location = "Albedo"
    const art1id = database.arts.new(art1)
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual(art1id)
    const art2 = await randomizeArtifact({ slotKey: "circlet" })
    art2.location = "Albedo"
    const art2id = database.arts.new(art2)
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual(art2id)
    expect(database.arts.get(art1id)?.location).toEqual("")

    database.chars.set("Amber", initialCharacter("Amber"))
    const bowid = database.weapons.new(defaultInitialWeapon("bow"))
    database.weapons.set(bowid, { location: "Amber" })
    expect(database.chars.get("Amber")!.equippedWeapon).toEqual(bowid)
    database.arts.set(art1id, { location: "Amber" })
    expect(database.chars.get("Amber")!.equippedArtifacts.circlet).toEqual(art1id)

    database.arts.set(art2id, { location: "Amber" })
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual(art1id)
    expect(database.chars.get("Amber")!.equippedArtifacts.circlet).toEqual(art2id)
    expect(database.arts.get(art1id)!.location).toEqual("Albedo")
  })

  test("cannot remove equipped weapon", async () => {
    database.chars.set("Albedo", initialCharacter("Albedo"))
    const sword1 = database.weapons.new({ ...defaultInitialWeapon("sword"), location: "Albedo" })
    database.weapons.remove(sword1)
    expect(database.weapons.get(sword1)).toBeTruthy()
    expect(database.chars.get("Albedo")!.equippedWeapon).toEqual(sword1)

    const sword2 = database.weapons.new({ ...defaultInitialWeapon("sword"), location: "Albedo" })
    database.weapons.remove(sword1)
    expect(database.weapons.get(sword1)).toBeFalsy()
    expect(database.chars.get("Albedo")!.equippedWeapon).toEqual(sword2)
  })

  test("Remove artifact with equipment", async () => {
    database.chars.set("Albedo", initialCharacter("Albedo"))
    const art1id = database.arts.new({ ...await randomizeArtifact({ slotKey: "circlet" }), location: "Albedo" })
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual(art1id)
    expect(database.arts.get(art1id)?.location).toEqual("Albedo")
    database.arts.remove(art1id)
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual("")
    expect(database.arts.get(art1id)).toBeUndefined()
  })

  test("Test import with initials", async () => {
    // When adding artifacts with equipment, expect character/weapons to be created
    const art1 = cachedArtifact(await randomizeArtifact({ slotKey: "circlet" }), "").artifact,
      art2 = cachedArtifact(await randomizeArtifact(), "circlet").artifact

    const amberWeapon = defaultInitialWeapon("bow")
    amberWeapon.location = "Amber"

    art1.location = "Albedo"
    art2.location = "Amber"
    const good: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      artifacts: [
        art1,
        art2
      ],
      weapons: [
        amberWeapon
      ]
    }
    const importResult = importGOOD(good, database, false, false)!
    expect(importResult).toBeTruthy()
    expect(importResult.artifacts.invalid.length).toEqual(0)
    expect(importResult.artifacts?.new?.length).toEqual(2)
    expect(importResult.weapons?.new?.length).toEqual(2)
    expect(importResult.characters?.new?.length).toEqual(2)
  })

  test("Test import with no equip", async () => {
    // When adding artifacts with equipment, expect character/weapons to be created
    const art1 = cachedArtifact(await randomizeArtifact({ slotKey: "circlet" }), "").artifact

    // Implicitly assign location
    const id = database.arts.new({ ...art1, location: "Amber" })

    expect(database.chars.get("Amber")!.equippedArtifacts.circlet).toEqual(id)

    const good: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      artifacts: [
        art1
      ]
    }

    // Import the new artifact, with no location. this should respect current equipment
    importGOOD(good, database, false, false)
    expect(database.chars.get("Amber")!.equippedArtifacts.circlet).toEqual(id)
  })

  test("Test partial merge", async () => {
    // Add Character and Artifact
    const albedo = initialCharacter("Albedo")
    const albedoWeapon = defaultInitialWeapon("sword")

    const art1 = cachedArtifact(await randomizeArtifact({ slotKey: "circlet", setKey: "EmblemOfSeveredFate" }), "").artifact
    art1.location = "Albedo"

    database.chars.set(albedo.key, albedo)
    albedoWeapon.id = database.weapons.new(albedoWeapon)

    art1.id = database.arts.new(art1)
    expect(database.chars.get("Albedo")?.equippedArtifacts.circlet).toEqual(art1.id)
    const good1: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      artifacts: [
        cachedArtifact(await randomizeArtifact({ slotKey: "circlet", setKey: "Instructor" }), "").artifact,
        { ...cachedArtifact(await randomizeArtifact({ slotKey: "circlet", setKey: "Adventurer" }), "").artifact, location: "Albedo" }
      ],
      weapons: [
        { ...initialWeapon("Akuoumaru"), location: "Albedo" }
      ]
    }
    const importResult = importGOOD(good1, database, true, false)!
    expect(importResult.artifacts.new.length).toEqual(2)
    expect(importResult.weapons.new.length).toEqual(1)
    expect(importResult.characters.new.length).toEqual(0)

    const arts = database.arts.values
    expect(arts.length).toEqual(3)
    expect(database.arts.values.reduce((t, art) => t + (art.location === "Albedo" ? 1 : 0), 0)).toEqual(1)
    const circletId = database.chars.get("Albedo")?.equippedArtifacts.circlet
    expect(circletId).toBeTruthy()
    expect(database.arts.get(circletId)?.setKey).toEqual("Adventurer")
    expect(database.weapons.get(database.chars.get("Albedo")!.equippedWeapon)?.key).toEqual("Akuoumaru")
  })
  test("Test Traveler share equipment", async () => {
    database.chars.set("TravelerAnemo", initialCharacter("TravelerAnemo"))
    database.chars.set("TravelerGeo", initialCharacter("TravelerGeo"))
    const art1 = await randomizeArtifact({ slotKey: "circlet", setKey: "EmblemOfSeveredFate" })
    const art1Id = database.arts.new({ ...art1, location: "Traveler" })
    database.chars.set("TravelerElectro", initialCharacter("TravelerElectro"))

    expect(database.chars.get("TravelerAnemo")!.equippedArtifacts.circlet).toEqual(art1Id)
    expect(database.chars.get("TravelerGeo")!.equippedArtifacts.circlet).toEqual(art1Id)
    expect(database.chars.get("TravelerElectro")!.equippedArtifacts.circlet).toEqual(art1Id)
    const weapon1Id = database.chars.get("TravelerAnemo")!.equippedWeapon
    expect(database.chars.get("TravelerGeo")!.equippedWeapon).toEqual(weapon1Id)
    expect(database.chars.get("TravelerElectro")!.equippedWeapon).toEqual(weapon1Id)

    const art2 = await randomizeArtifact({ slotKey: "circlet", setKey: "ArchaicPetra" })
    const art2Id = database.arts.new({ ...art2, location: "Traveler" })
    expect(database.chars.get("TravelerAnemo")!.equippedArtifacts.circlet).toEqual(art2Id)
    expect(database.chars.get("TravelerGeo")!.equippedArtifacts.circlet).toEqual(art2Id)
    expect(database.chars.get("TravelerElectro")!.equippedArtifacts.circlet).toEqual(art2Id)

    const weapon2Id = database.weapons.new({ ...initialWeapon("SkywardBlade"), location: "Traveler" })
    expect(database.chars.get("TravelerAnemo")!.equippedWeapon).toEqual(weapon2Id)
    expect(database.chars.get("TravelerGeo")!.equippedWeapon).toEqual(weapon2Id)
    expect(database.chars.get("TravelerElectro")!.equippedWeapon).toEqual(weapon2Id)

    // deletion dont remove equipment until all traveler is gone
    database.chars.remove("TravelerElectro")
    database.chars.remove("TravelerGeo")

    expect(database.chars.get("TravelerAnemo")!.equippedArtifacts.circlet).toEqual(art2Id)
    expect(database.chars.get("TravelerAnemo")!.equippedWeapon).toEqual(weapon2Id)
    expect(database.arts.get(art2Id)!.location).toEqual("Traveler")
    expect(database.weapons.get(weapon2Id)!.location).toEqual("Traveler")

    // deletion of final traveler unequips
    database.chars.remove("TravelerAnemo")

    expect(database.arts.get(art2Id)!.location).toEqual("")
    expect(database.weapons.get(weapon2Id)!.location).toEqual("")
  })
})
