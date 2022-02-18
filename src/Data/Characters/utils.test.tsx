import { mapNormals } from "./utils"
import Xingqiu_gen from "./Xingqiu/skillParam_gen.json"
import KaedeharaKazuha_gen from "./KaedeharaKazuha/skillParam_gen.json"

describe('Character composition utils', () => {
  describe('mapNormals', () => {
    test("Xingqiu", () => {
      const characterKey = "Xingqiu"
      const normals = Xingqiu_gen.auto.slice(0, 7)
      const { section } = mapNormals(characterKey, normals, [[2, 4], [5, 7]])
      expect(section.fields.map(o => o.textSuffix)).toEqual([
        "", "", "(2 Hits)", "", "(2 Hits)"
      ])
      expect(section.fields.map(o => o.node.info?.key)).toEqual([
        `char_${characterKey}_gen:auto.skillParams.${0}`,
        `char_${characterKey}_gen:auto.skillParams.${1}`,
        `char_${characterKey}_gen:auto.skillParams.${2}`,
        `char_${characterKey}_gen:auto.skillParams.${3}`,
        `char_${characterKey}_gen:auto.skillParams.${4}`
      ])
    })
    test.only("KaedeharaKazuha", () => {
      const characterKey = "KaedeharaKazuha"
      const normals = KaedeharaKazuha_gen.auto.slice(0, 6)
      const { section } = mapNormals(characterKey, normals, [[2, 4]], [[5, 3]])
      expect(section.fields.map(o => o.textSuffix)).toEqual([
        "", "", "(1)", "(2)", "", "(3 Hits)"
      ])
      expect(section.fields.map(o => o.node.info?.key)).toEqual([
        `char_${characterKey}_gen:auto.skillParams.${0}`,
        `char_${characterKey}_gen:auto.skillParams.${1}`,
        `char_${characterKey}_gen:auto.skillParams.${2}`,
        `char_${characterKey}_gen:auto.skillParams.${2}`,
        `char_${characterKey}_gen:auto.skillParams.${3}`,
        `char_${characterKey}_gen:auto.skillParams.${4}`
      ])
    })
  })
})