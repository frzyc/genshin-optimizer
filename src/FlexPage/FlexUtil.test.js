import { characters, artifacts, flexObj, oldURL } from './FlexUtil.test.data'
import { createFlexObj, parseFlexObj } from './FlexUtil'
import { DatabaseInitAndVerify } from '../Database/DatabaseUtil'
import { saveToLocalStorage } from '../Util/Util'

function setupLS() {
  characters.map(char => saveToLocalStorage(`char_${char.characterKey}`, char))
  Object.entries(artifacts).map(([id, art]) => saveToLocalStorage(id, art))
}
describe('flex import export', () => {
  beforeEach(() => {
    setupLS()
    DatabaseInitAndVerify()
  })
  afterEach(() => localStorage.clear())

  test('should support round tripping', () => {
    expect(parseFlexObj(createFlexObj("hutao"))[0]).toEqual(flexObj)
  })
  test('should support old format', () => {
    let [obj] = parseFlexObj(oldURL.split("flex?")[1])
    // We're dropping conditional values from old version
    expect({ ...obj, conditionalValues: flexObj.conditionalValues }).toEqual(flexObj)
  })
})
