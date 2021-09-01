import { character, artifacts, oldURL } from './FlexUtil.test.data'
import { createFlexObj, parseFlexObj } from './FlexUtil'
import { database } from '../Database/Database'
import { validateFlexArtifact, validateFlexCharacter } from '../Database/validation'
import { deepClone } from '../Util/Util'
import { allSlotKeys } from '../Types/consts'
import { dbStorage } from '../Database/DBStorage'

let flexObj: any

describe('flex import export', () => {
  beforeEach(() => {
    dbStorage.clear()
    database.reloadStorage()
    database.updateChar(validateFlexCharacter(character))
    Object.entries(artifacts).map(([id, art]) => {
      database.updateArt(validateFlexArtifact(art, id).artifact)
      database.setLocation(id, art.location)
    })
    const char = deepClone(database._getChar(character.characterKey)!)
    const arts = deepClone(Object.values(char.equippedArtifacts).map(id => database._getArt(id)!))
    // unequipped everything
    char.equippedArtifacts = Object.fromEntries(allSlotKeys.map(slot => [slot, ""])) as any
    // unbind ids
    arts.forEach(art => art.id = "")
    flexObj = { character: char, artifacts: arts }
  })
  afterEach(() => localStorage.clear())

  test('should support round tripping', () => {
    expect(parseFlexObj(createFlexObj(character.characterKey, database)!)![0]).toEqual(flexObj)
  })
  test('should support old format', () => {
    const [{ character, artifacts }] = parseFlexObj(oldURL.split("flex?")[1])!
    // We're dropping conditional values and infusion from old version
    character.conditionalValues = flexObj.character.conditionalValues
    character.infusionAura = 'pyro'
    expect({ character, artifacts }).toEqual(flexObj)
  })
})
