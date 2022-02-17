import { mapNormals } from "./utils"
import skillParam_gen from "./Xingqiu/skillParam_gen.json"

describe('Character composition utils', () => {
  describe('mapNormals', () => {
    test.only("Xingqiu", () => {
      const characterKey = "Xingqiu"
      const normals = skillParam_gen.auto.slice(0, 7)
      const { section } = mapNormals(normals, [[2, 4], [5, 7]], characterKey)
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
    test("KaedeharaKazuha", () => {
      const characterKey = "KaedeharaKazuha"
      const normals = skillParam_gen.auto.slice(0, 8)
      const { section } = mapNormals(normals, [[2, 3], [5, 7]], characterKey)
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