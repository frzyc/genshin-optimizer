import { chars, arts, characterObj, flexObj } from './FlexUtil.test.data'
import { saveToLocalStorage } from './Util'
import { createFlexObj, parseFlexObj } from './FlexUtil'
import { DatabaseInitAndVerify } from '../Database/DatabaseUtil'
import urlon from 'urlon'

function setupLS() {
  Object.entries(chars).map(([id, char]) => saveToLocalStorage(`char_${id}`, char))
  Object.entries(arts).map(([id, art]) => saveToLocalStorage(id, art))
}
describe('flex import export', () => {
  beforeEach(() => {
    setupLS()
    DatabaseInitAndVerify()
  })
  afterEach(() => localStorage.clear())

  test('should support round tripping', () => {
    expect(parseFlexObj(createFlexObj("ningguang"))).toEqual(characterObj)
  })
  test('should support old format', () => {
    expect(parseFlexObj(urlon.stringify(flexObj))).toEqual(characterObj)
  })
})