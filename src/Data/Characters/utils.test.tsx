import { mapNormals } from "./utils"
import skillParam_gen from "./Xingqiu/skillParam_gen.json"

describe('Character composition utils', () => {
  it('should map normals', () => {
    const characterKey = "Xingqiu"
    const normals = skillParam_gen.auto.slice(0, 7)
    const { section } = mapNormals(normals, [[2, 3], [5, 6]], characterKey)
    expect(section.fields.map(o => o.textSuffix)).toEqual([
      "", "", "(1)", "(2)", "", "(1)", "(2)",
    ])
    expect(section.fields.map(o => o.node.info?.key)).toEqual([
      `char_${characterKey}_gen:auto.skillParams.${0}`,
      `char_${characterKey}_gen:auto.skillParams.${1}`,
      `char_${characterKey}_gen:auto.skillParams.${2}`,
      `char_${characterKey}_gen:auto.skillParams.${2}`,
      `char_${characterKey}_gen:auto.skillParams.${3}`,
      `char_${characterKey}_gen:auto.skillParams.${4}`,
      `char_${characterKey}_gen:auto.skillParams.${4}`
    ])
  })
})