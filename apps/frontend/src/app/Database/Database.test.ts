import { CharacterKey } from "@genshin-optimizer/consts"
import { IArtifact } from "../Types/artifact"
import { IWeapon } from "../Types/weapon"
import { randomizeArtifact } from "../Util/ArtifactUtil"
import { defaultInitialWeapon, initialWeapon } from "../Util/WeaponUtil"
import { ArtCharDatabase } from "./Database"
import { initialCharacter } from "./DataManagers/CharacterData"
import { DBLocalStorage, SandboxStorage } from "./DBStorage"
import { IGO, IGOOD } from "./exim"

const dbStorage = new DBLocalStorage(localStorage)
const dbIndex = 1;
let database = new ArtCharDatabase(dbIndex, dbStorage)

describe("Database", () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbIndex, dbStorage)
  })

  test("Support roundtrip import-export", () => {
    const albedo = initialCharacter("Albedo"), amber = initialCharacter("Amber")
    const albedoWeapon = defaultInitialWeapon("sword"), amberWeapon = defaultInitialWeapon("bow")

    const art1 = randomizeArtifact({ slotKey: "circlet" }), art2 = randomizeArtifact()
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

    const newDB = new ArtCharDatabase(dbIndex, new SandboxStorage())
    const good = database.exportGOOD()
    newDB.importGOOD(good, false, false)!
    expect(database.storage.entries.filter(([k]) => k.startsWith("weapon_") || k.startsWith("character_") || k.startsWith("artifact_")))
      .toEqual(newDB.storage.entries.filter(([k]) => k.startsWith("weapon_") || k.startsWith("character_") || k.startsWith("artifact_")))
    expect(database.chars.values).toEqual(newDB.chars.values)
    expect(database.weapons.values).toEqual(newDB.weapons.values)
    expect(database.arts.values).toEqual(newDB.arts.values)
    // Can't check IcharacterCache because equipped can have differing id
  })

  test("Does not crash from invalid storage", () => {
    function tryStorage(setup: (storage: Storage) => void, verify: (storage: Storage) => void = () => null) {
      localStorage.clear()
      setup(localStorage)
      new ArtCharDatabase(dbIndex, dbStorage)
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
  test("Ensure Equipment", () => {
    const newKeys: CharacterKey[] = []
    const unfollow = database.chars.followAny((k, reason, value) => reason === "new" && newKeys.push(k))
    database.arts.new({ ...randomizeArtifact(), location: "Amber" })
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

  test("Equip swap", () => {
    database.chars.set("Albedo", initialCharacter("Albedo"))
    database.weapons.new({ ...defaultInitialWeapon("sword"), location: "Albedo" })

    const art1 = randomizeArtifact({ slotKey: "circlet" })
    art1.location = "Albedo"
    const art1id = database.arts.new(art1)
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual(art1id)
    const art2 = randomizeArtifact({ slotKey: "circlet" })
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

  test("cannot remove equipped weapon", () => {
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

  test("Remove artifact with equipment", () => {
    database.chars.set("Albedo", initialCharacter("Albedo"))
    const art1id = database.arts.new({ ...randomizeArtifact({ slotKey: "circlet" }), location: "Albedo" })
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual(art1id)
    expect(database.arts.get(art1id)?.location).toEqual("Albedo")
    database.arts.remove(art1id)
    expect(database.chars.get("Albedo")!.equippedArtifacts.circlet).toEqual("")
    expect(database.arts.get(art1id)).toBeUndefined()
  })

  test("Test import with initials", () => {
    // When adding artifacts with equipment, expect character/weapons to be created
    const art1 = randomizeArtifact({ slotKey: "circlet", location: "Albedo" }),
      art2 = randomizeArtifact({ location: "Amber" })

    const amberWeapon = defaultInitialWeapon("bow")
    amberWeapon.location = "Amber"

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
    const importResult = database.importGOOD(good as IGOOD & IGO, false, false)
    expect(importResult.characters?.new?.length).toEqual(2)
    expect(importResult.artifacts.invalid.length).toEqual(0)
    expect(importResult.artifacts?.new?.length).toEqual(2)
    expect(importResult.weapons?.new?.length).toEqual(2)

  })

  test("Test import with no equip", () => {
    // When adding artifacts with equipment, expect character/weapons to be created
    const art1 = randomizeArtifact({ slotKey: "circlet", location: "Amber" })

    // Implicitly assign location
    const id = database.arts.new(art1)

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
    database.importGOOD(good as IGOOD & IGO, false, false)
    expect(database.chars.get("Amber")?.equippedArtifacts.circlet).toEqual(id)
  })

  test("Test partial merge", () => {
    // Add Character and Artifact
    const albedo = initialCharacter("Albedo")
    const albedoWeapon = defaultInitialWeapon("sword")
    albedoWeapon.location = "Albedo"

    const art1 = randomizeArtifact({ slotKey: "circlet", setKey: "EmblemOfSeveredFate", location: "Albedo" })

    database.chars.set(albedo.key, albedo)
    const weaponid = database.weapons.new(albedoWeapon)
    database.weapons.set(weaponid, albedoWeapon)

    const art1id = database.arts.new(art1)
    expect(database.chars.get("Albedo")?.equippedArtifacts.circlet).toEqual(art1id)
    expect(database.chars.get("Albedo")?.equippedWeapon).toEqual(weaponid)
    const good1: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      artifacts: [
        randomizeArtifact({ slotKey: "circlet", setKey: "Instructor" }),
        randomizeArtifact({ slotKey: "circlet", setKey: "Adventurer", location: "Albedo" })
      ],
      weapons: [
        { ...initialWeapon("CinnabarSpindle"), location: "Albedo" }
      ]
    }
    const importResult = database.importGOOD(good1 as IGOOD & IGO, true, false)
    expect(importResult.artifacts.new.length).toEqual(2)
    expect(importResult.weapons.new.length).toEqual(1)
    expect(importResult.characters.new.length).toEqual(0)

    const arts = database.arts.values
    expect(arts.length).toEqual(3)
    expect(database.arts.values.reduce((t, art) => t + (art.location === "Albedo" ? 1 : 0), 0)).toEqual(1)
    const circletId = database.chars.get("Albedo")?.equippedArtifacts.circlet
    expect(circletId).toBeTruthy()
    expect(database.arts.get(circletId)?.setKey).toEqual("Adventurer")
    expect(database.weapons.get(database.chars.get("Albedo")?.equippedWeapon)?.key).toEqual("CinnabarSpindle")
  })

  test('should merge scanner with dups for weapons', () => {
    const a1 = initialWeapon("Akuoumaru")
    const a2old = initialWeapon("BlackTassel")
    const a2new= initialWeapon("BlackTassel")
    a2new.level=20
    const a3 = initialWeapon("CalamityQueller") // in db but not in import
    const a4 = initialWeapon("Deathmatch") // in import but not in db

    const dupId = database.weapons.new(a1)
    const upgradeId = database.weapons.new(a2old)
    database.weapons.new(a3)
    const good1: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      weapons: [a1, a2new, a4],
    }
    const importResult = database.importGOOD(good1 as IGOOD & IGO, true, false)
    expect(importResult.weapons.upgraded.length).toEqual(1)
    expect(importResult.weapons.unchanged.length).toEqual(1)
    expect(importResult.weapons.notInImport).toEqual(1)
    expect(importResult.weapons.new.length).toEqual(1)
    expect(database.weapons.values.length).toEqual(4)
    const dbA1 = database.weapons.get(dupId)
    expect(dbA1?.key).toEqual("Akuoumaru")
    const dbA2 = database.weapons.get(upgradeId)
    expect(dbA2?.key).toEqual("BlackTassel")
    expect(dbA2?.level).toEqual(20)
  })

  test('should merge scanner with dups for artifacts', () => {
    const a1 = randomizeArtifact({ slotKey: "flower" }) // dup
    const a2old: IArtifact = { // before
      level: 0,
      location: "",
      lock: false,
      mainStatKey: "atk",
      rarity: 3,
      setKey: "Instructor",
      slotKey: "plume",
      substats: [
        { key: "atk_", value: 5 }
      ]
    }
    const a2new: IArtifact = { // upgrade
      level: 4,
      location: "",
      lock: false,
      mainStatKey: "atk",
      rarity: 3,
      setKey: "Instructor",
      slotKey: "plume",
      substats: [
        { key: "atk_", value: 5 },
        { key: "def_", value: 5 }
      ]
    }
    const a3 = randomizeArtifact({ slotKey: "goblet" }) // in db but not in import
    const a4 = randomizeArtifact({ slotKey: "circlet" }) // in import but not in db

    const dupId = database.arts.new(a1)
    const upgradeId = database.arts.new(a2old)
    database.arts.new(a3)
    const good1: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      artifacts: [a1, a2new, a4],
    }
    const importResult = database.importGOOD(good1 as IGOOD & IGO, true, false)
    expect(importResult.artifacts.upgraded.length).toEqual(1)
    expect(importResult.artifacts.unchanged.length).toEqual(1)
    expect(importResult.artifacts.notInImport).toEqual(1)
    expect(importResult.artifacts.new.length).toEqual(1)
    expect(database.arts.values.length).toEqual(4)
    const dbA1 = database.arts.get(dupId)
    expect(dbA1?.slotKey).toEqual("flower")
    const dbA2 = database.arts.get(upgradeId)
    expect(dbA2?.slotKey).toEqual("plume")
    expect(dbA2?.level).toEqual(4)
  })
  test("Import character without weapon should give default weapon", () => {
    const good = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      characters: [{
        "key": "Dori",
        "level": 40,
        "constellation": 0,
        "ascension": 1,
        "talent": {
          "auto": 1,
          "skill": 1,
          "burst": 1
        }
      }],
    }
    const importResult = database.importGOOD(good as IGOOD & IGO, false, false)
    expect(importResult.weapons.new.length).toEqual(1)
    expect(importResult.characters.new.length).toEqual(1)
    expect(database.chars.get("Dori")?.equippedWeapon).toBeTruthy()
  })
  describe('import again with overlapping ids', () => {
    test("import again with overlapping artifact ids", () => {
      const old1 = randomizeArtifact({ slotKey: "plume" })
      const old2 = randomizeArtifact({ slotKey: "flower" })
      const old3 = randomizeArtifact({ slotKey: "goblet" })
      const old4 = randomizeArtifact({ slotKey: "circlet" })

      const oldId1 = database.arts.new(old1)
      const oldId2 = database.arts.new(old2)
      const oldId3 = database.arts.new(old3)
      const oldId4 = database.arts.new(old4)
      expect([oldId1, oldId2, oldId3, oldId4]).toEqual(["artifact_0", "artifact_1", "artifact_2", "artifact_3"])

      const good: IGOOD = {
        format: "GOOD",
        version: 1,
        source: "Genshin Optimizer",
        artifacts: [
          { ...old1, id: oldId1 } as IArtifact,
          { ...old2, id: oldId2 } as IArtifact,

          //swap these two
          { ...old4, id: oldId3 } as IArtifact,
          { ...old3, id: oldId4 } as IArtifact,
        ]
      }

      const importResult = database.importGOOD(good as IGOOD & IGO, true, false)
      expect(importResult.artifacts.notInImport).toEqual(0)
      expect(importResult.artifacts.unchanged.length).toEqual(4)
      expect(database.arts.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.arts.get(oldId1)?.slotKey).toEqual("plume")
      expect(database.arts.get(oldId2)?.slotKey).toEqual("flower")
      expect(database.arts.get(oldId3)?.slotKey).toEqual("circlet")
      expect(database.arts.get(oldId4)?.slotKey).toEqual("goblet")
    })

    test("import again with overlapping weapon ids", () => {

      const old1 = initialWeapon("AmenomaKageuchi")
      const old2 = initialWeapon("BlackcliffSlasher")
      const old3 = initialWeapon("CalamityQueller")
      const old4 = initialWeapon("Deathmatch")

      const oldId1 = database.weapons.new(old1)
      const oldId2 = database.weapons.new(old2)
      const oldId3 = database.weapons.new(old3)
      const oldId4 = database.weapons.new(old4)
      expect([oldId1, oldId2, oldId3, oldId4]).toEqual(["weapon_0", "weapon_1", "weapon_2", "weapon_3"])

      const good: IGOOD = {
        format: "GOOD",
        version: 1,
        source: "Genshin Optimizer",
        weapons: [
          { ...old1, id: oldId1 } as IWeapon,
          { ...old2, id: oldId2 } as IWeapon,

          //swap these two
          { ...old4, id: oldId3 } as IWeapon,
          { ...old3, id: oldId4 } as IWeapon,
        ]
      }

      const importResult = database.importGOOD(good as IGOOD & IGO, true, false)
      expect(importResult.weapons.notInImport).toEqual(0)
      expect(importResult.weapons.unchanged.length).toEqual(4)
      expect(database.weapons.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.weapons.get(oldId1)?.key).toEqual("AmenomaKageuchi")
      expect(database.weapons.get(oldId2)?.key).toEqual("BlackcliffSlasher")
      expect(database.weapons.get(oldId3)?.key).toEqual("Deathmatch")
      expect(database.weapons.get(oldId4)?.key).toEqual("CalamityQueller")
    })
  })

  describe('mutial exclusion import with ids', () => {
    test("import with mutually-exclusive artifact ids", () => {
      const old1 = randomizeArtifact({ slotKey: "plume" })
      const old2 = randomizeArtifact({ slotKey: "flower" })
      const new1 = randomizeArtifact({ slotKey: "goblet" })
      const new2 = randomizeArtifact({ slotKey: "circlet" })

      const oldId1 = database.arts.new(old1)
      const oldId2 = database.arts.new(old2)
      expect([oldId1, oldId2]).toEqual(["artifact_0", "artifact_1"])

      const good: IGOOD = {
        format: "GOOD",
        version: 1,
        source: "Genshin Optimizer",
        artifacts: [
          { ...new1, id: oldId1 } as IArtifact,
          { ...new2, id: oldId2 } as IArtifact,
        ]
      }

      const importResult = database.importGOOD(good as IGOOD & IGO, true, false)
      expect(importResult.artifacts.notInImport).toEqual(2)
      expect(database.arts.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.arts.get(oldId1)?.slotKey).toEqual("goblet")
      expect(database.arts.get(oldId2)?.slotKey).toEqual("circlet")
      // Expect old artifacts to have new id
      expect(database.arts.values.find(a => a.slotKey === "plume")?.id).not.toEqual(oldId1)
      expect(database.arts.values.find(a => a.slotKey === "flower")?.id).not.toEqual(oldId2)
    })

    test("import with mutually exclusive weapon ids", () => {

      const old1 = initialWeapon("AmenomaKageuchi")
      const old2 = initialWeapon("BlackcliffSlasher")
      const new1 = initialWeapon("CalamityQueller")
      const new2 = initialWeapon("Deathmatch")

      const oldId1 = database.weapons.new(old1)
      const oldId2 = database.weapons.new(old2)
      expect([oldId1, oldId2]).toEqual(["weapon_0", "weapon_1"])

      const good: IGOOD = {
        format: "GOOD",
        version: 1,
        source: "Genshin Optimizer",
        weapons: [
          { ...new1, id: oldId1 } as IWeapon,
          { ...new2, id: oldId2 } as IWeapon,
        ]
      }

      const importResult = database.importGOOD(good as IGOOD & IGO, true, false)
      expect(importResult.weapons.notInImport).toEqual(2)
      expect(database.weapons.values.length).toEqual(4)
      // Expect imports to overwrite the id of old
      expect(database.weapons.get(oldId1)?.key).toEqual("CalamityQueller")
      expect(database.weapons.get(oldId2)?.key).toEqual("Deathmatch")
      // Expect old artifacts to have new id
      expect(database.weapons.values.find(a => a.key === "AmenomaKageuchi")?.id).not.toEqual(oldId1)
      expect(database.weapons.values.find(a => a.key === "BlackcliffSlasher")?.id).not.toEqual(oldId2)
    })
  })

  describe("Traveler Handling", () => {
    test("Test Traveler share equipment", () => {
      database.chars.set("TravelerAnemo", initialCharacter("TravelerAnemo"))
      database.chars.set("TravelerGeo", initialCharacter("TravelerGeo"))
      const art1 = randomizeArtifact({ slotKey: "circlet", setKey: "EmblemOfSeveredFate" })
      const art1Id = database.arts.new({ ...art1, location: "Traveler" })
      database.chars.set("TravelerElectro", initialCharacter("TravelerElectro"))

      expect(database.chars.get("TravelerAnemo")!.equippedArtifacts.circlet).toEqual(art1Id)
      expect(database.chars.get("TravelerGeo")!.equippedArtifacts.circlet).toEqual(art1Id)
      expect(database.chars.get("TravelerElectro")!.equippedArtifacts.circlet).toEqual(art1Id)
      const weapon1Id = database.chars.get("TravelerAnemo")!.equippedWeapon
      expect(database.chars.get("TravelerGeo")!.equippedWeapon).toEqual(weapon1Id)
      expect(database.chars.get("TravelerElectro")!.equippedWeapon).toEqual(weapon1Id)

      const art2 = randomizeArtifact({ slotKey: "circlet", setKey: "ArchaicPetra" })
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

  describe('DataManager.changeId', () => {
    test('should changeId for artifacts', () => {
      const art = randomizeArtifact({ location: "Albedo", slotKey: "flower" })
      const oldId = database.arts.new(art)
      const newId = "newTestId"
      database.arts.changeId(oldId, newId)

      expect(database.arts.get(oldId)).toBeUndefined()

      const cachArt = database.arts.get(newId)
      expect(cachArt).toBeTruthy()
      expect(cachArt?.location).toEqual("Albedo")
      expect(database.chars.get("Albedo")?.equippedArtifacts.flower).toEqual(newId)
    })
    test('should changeId for weapons', () => {
      const weapon = initialWeapon("AmenomaKageuchi")
      weapon.location = "Albedo"
      const oldId = database.weapons.new(weapon)
      const newId = "newTestId"
      database.weapons.changeId(oldId, newId)

      expect(database.weapons.get(oldId)).toBeUndefined()

      const cachWea = database.weapons.get(newId)
      expect(cachWea).toBeTruthy()
      expect(cachWea?.location).toEqual("Albedo")
      expect(database.chars.get("Albedo")?.equippedWeapon).toEqual(newId)
    })
  })

  test("Test invalid weapon location", () => {
    // Add Character and Artifact
    const albedo = initialCharacter("Albedo")
    const albedoWeapon = defaultInitialWeapon("sword")
    albedoWeapon.location = "Albedo"


    database.chars.set(albedo.key, albedo)
    const swordid = database.weapons.new(albedoWeapon)
    database.weapons.set(swordid, albedoWeapon)

    expect(database.chars.get("Albedo")?.equippedWeapon).toEqual(swordid)
    const good1: IGOOD = {
      format: "GOOD",
      version: 1,
      source: "Scanner",
      weapons: [
        //invalid bow on sword char
        { ...initialWeapon("AlleyHunter"), location: "Albedo" }
      ]
    }
    const importResult = database.importGOOD(good1 as IGOOD & IGO, true, false)
    expect(importResult.weapons.invalid.length).toEqual(1)
    expect(importResult.characters.new.length).toEqual(0)
    expect(database.weapons.get(database.chars.get("Albedo")?.equippedWeapon)?.key).toEqual("DullBlade")
  })

})
