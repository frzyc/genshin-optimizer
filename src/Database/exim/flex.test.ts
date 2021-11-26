import { getSheets } from '../../ReactHooks/useSheets'
import { ArtCharDatabase } from '../Database'
import { SandboxStorage } from '../DBStorage'
import { removeArtifactCache, removeCharacterCache, removeWeaponCache } from '../validation'
import { exportFlex, importFlex } from './flex'
import { artifacts, character, urlV2, urlV3, weapon } from './flex.test.data'

const storage = new SandboxStorage()
storage.setString("db_ver", "14")
storage.set(`char_${character.key}`, character)
storage.set("weapon_1", weapon)
artifacts.map((art, id) => storage.set(`artifact_${id + 1}`, art))
const database = new ArtCharDatabase(storage)

describe('flex import export', () => {
  test('should support round tripping', async () => {
    const sheets = await getSheets()
    const [flexDatabase, flexCharacterKey] = importFlex(exportFlex(character.key, database, sheets)!)!
    const flexCharacter = flexDatabase._getChar(flexCharacterKey)!
    const flexWeapon = flexDatabase._getWeapon(flexCharacter.equippedWeapon)!
    const flexArtifacts = Object.values(flexCharacter.equippedArtifacts)
      .filter(id => id).map(id => flexDatabase._getArt(id)!)

    expect(removeCharacterCache(flexCharacter)).toEqual(character)
    expect(removeWeaponCache(flexWeapon)).toEqual(weapon)
    expect(flexArtifacts.length).toEqual(artifacts.length)
    expect(flexArtifacts.map(removeArtifactCache)).toEqual(expect.arrayContaining(artifacts))
  })
  test('should support flex v2', () => {
    const [flexDatabase, flexCharacterKey] = importFlex(urlV2.split("flex?")[1])!
    const flexCharacter = flexDatabase._getChar(flexCharacterKey)!
    const flexWeapon = flexDatabase._getWeapon(flexCharacter.equippedWeapon)!
    const flexArtifacts = Object.values(flexCharacter.equippedArtifacts)
      .filter(id => id).map(id => flexDatabase._getArt(id)!)

    // We're dropping conditional values and infusion from old version
    flexCharacter.conditionalValues = character.conditionalValues
    flexCharacter.infusionAura = 'pyro'

    expect(removeCharacterCache(flexCharacter)).toEqual(character)
    expect(removeWeaponCache(flexWeapon)).toEqual(weapon)
    expect(flexArtifacts.length).toEqual(artifacts.length)
    expect(flexArtifacts.map(removeArtifactCache)).toEqual(expect.arrayContaining(artifacts))
  })
  test('should support flex v3', () => {
    const [flexDatabase, flexCharacterKey] = importFlex(urlV3.split("flex?")[1])!
    const flexCharacter = flexDatabase._getChar(flexCharacterKey)!
    const flexWeapon = flexDatabase._getWeapon(flexCharacter.equippedWeapon)!
    const flexArtifacts = Object.values(flexCharacter.equippedArtifacts)
      .filter(id => id).map(id => flexDatabase._getArt(id)!)

    // We're dropping conditional values and infusion from old version
    flexCharacter.conditionalValues = character.conditionalValues
    flexCharacter.infusionAura = 'pyro'

    expect(removeCharacterCache(flexCharacter)).toEqual(character)
    expect(removeWeaponCache(flexWeapon)).toEqual(weapon)
    expect(flexArtifacts.length).toEqual(artifacts.length)
    expect(flexArtifacts.map(removeArtifactCache)).toEqual(expect.arrayContaining(artifacts))
  })

})
