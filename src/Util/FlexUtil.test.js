import { chars, arts, characterObj, flexObj } from './FlexUtil.test.data'
import { saveToLocalStorage } from './Util'
import { createFlexObj, parseFlexObj } from './FlexUtil'
import { DatabaseInitAndVerify } from '../Database/DatabaseUtil'

function setupLS() {
  Object.entries(chars).map(([id, char]) => saveToLocalStorage(`char_${id}`, char))
  Object.entries(arts).map(([id, art]) => saveToLocalStorage(id, art))
}
afterEach(() => localStorage.clear())
test('should create Obj', () => {
  setupLS()
  DatabaseInitAndVerify()
  expect(createFlexObj("ningguang")).toEqual(flexObj)
})

test('should parse characterObj', () => {
  setupLS()
  DatabaseInitAndVerify()
  expect(parseFlexObj(flexObj)).toEqual(characterObj)
})