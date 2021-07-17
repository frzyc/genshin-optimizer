import { characters, artifacts, flexObj, oldURL } from './FlexUtil.test.data'
import { createFlexObj, parseFlexObj } from './FlexUtil'
import { database } from '../Database/Database'

describe('flex import export', () => {
  beforeEach(() => {
    database.clear()
    characters.map(char => database.updateChar(char))
    Object.values(artifacts).map(art => {
      database.updateArt(art)
      database.setLocation(art.id, art.location)
    })
  })
  afterEach(() => localStorage.clear())

  test('should support round tripping', () => {
    expect(parseFlexObj(createFlexObj("hutao")!)![0]).toEqual(flexObj)
  })
  test('should support old format', () => {
    const [{ character, artifacts }] = parseFlexObj(oldURL.split("flex?")[1])!
    // We're dropping conditional values and infusion from old version
    character.conditionalValues = flexObj.character.conditionalValues
    character.infusionAura = 'pyro'
    expect({ character, artifacts }).toEqual(flexObj)
  })
})
