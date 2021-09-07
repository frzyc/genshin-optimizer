import { character, artifacts, weapon, oldURL } from './FlexUtil.test.data'
import { createFlexObj, parseFlexObj } from './FlexUtil'
import { ArtCharDatabase } from '../Database/Database'
import { SandboxStorage } from '../Database/DBStorage'
import { removeArtifactCache, removeCharacterCache, removeWeaponCache } from '../Database/validation'

const storage = new SandboxStorage()
storage.setString("db_ver", "8")
storage.set(`char_${character.key}`, character)
storage.set("weapon_1", weapon)
artifacts.map((art, id) => storage.set(`artifact_${id + 1}`, art))
const database = new ArtCharDatabase(storage)

describe('flex import export', () => {
  test('should support round tripping', () => {
    const [flexDatabase, flexCharacterKey] = parseFlexObj(createFlexObj(character.key, database)!)!
    const flexCharacter = flexDatabase._getChar(flexCharacterKey)!
    const flexWeapon = flexDatabase._getWeapon(flexCharacter.equippedWeapon)!
    const flexArtifacts = Object.values(flexCharacter.equippedArtifacts)
      .filter(id => id).map(id => database._getArt(id)!)

    expect(removeCharacterCache(flexCharacter)).toEqual(character)
    expect(removeWeaponCache(flexWeapon)).toEqual(weapon)
    expect(flexArtifacts.length).toEqual(artifacts.length)
    expect(flexArtifacts.map(removeArtifactCache)).toEqual(expect.arrayContaining(artifacts))
  })
  test('should support old format', () => {
    const [flexDatabase, flexCharacterKey] = parseFlexObj(oldURL.split("flex?")[1])!
    const flexCharacter = flexDatabase._getChar(flexCharacterKey)!
    const flexWeapon = flexDatabase._getWeapon(flexCharacter.equippedWeapon)!
    const flexArtifacts = Object.values(flexCharacter.equippedArtifacts)
      .filter(id => id).map(id => database._getArt(id)!)

    // We're dropping conditional values and infusion from old version
    flexCharacter.conditionalValues = character.conditionalValues
    flexCharacter.infusionAura = 'pyro'

    expect(removeCharacterCache(flexCharacter)).toEqual(character)
    expect(removeWeaponCache(flexWeapon)).toEqual(weapon)
    expect(flexArtifacts.length).toEqual(artifacts.length)
    expect(flexArtifacts.map(removeArtifactCache)).toEqual(expect.arrayContaining(artifacts))
  })
})
