import IConditional from "../Types/IConditional"
import { crawlObject } from "../Util/Util"
import Conditional from "./Conditional"
const joinPath = (keys) => `Conditional.conditionals.${keys.join('.')}`
expect.extend({
  toBeValidConditional(conditional: IConditional, keys) {
    const path = joinPath(keys)
    if (typeof conditional.canShow !== "function") return {
      message: () => `${path}.canShow is invalid, should be a function (stats)=> true if show, or omitted if its always shown.`,
      pass: false
    }
    return {
      message: () => `${path} is valid`,
      pass: true
    }
  }
})
describe('Conditional tests', () => {
  beforeAll(() => Conditional.processed)
  test('should import', () => {
    expect(Object.keys(Conditional.conditionals)).toEqual(expect.arrayContaining(["artifact", "character", "weapon"]))
  })
  test('should be all valid conditionals', () => {
    crawlObject(Conditional.conditionals, [], c => c?.name !== undefined || c?.maxStack === 0, (conditional, keys) => {
      expect(conditional).toBeValidConditional(keys)
      conditional.field?.forEach?.((field, i) => {
        expect(field).toBeValidField(`${joinPath(keys)}.fields[${i}]`)
      })
    })
  })
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidConditional(keys: any): any
    }
  }
}
