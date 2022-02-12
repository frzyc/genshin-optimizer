import { mapNormals, mapSkillParams } from "./utils"
import skillParam_gen from "./Xingqiu/skillParam_gen.json"

describe('Character composition utils', () => {
  it("maps skill params", () => {
    const mapped = mapSkillParams(skillParam_gen, [
      ["auto[0]", "normal.hitArr[0]"],
      ["auto[1]", "normal.hitArr[1]"],
      ["auto[2]", "normal.hitArr[2]"],
      ["auto[3]", "normal.hitArr[3]"],
      ["auto[4]", "normal.hitArr[4]"],
      ["auto[5]", "normal.hitArr[5]"],
      ["auto[6]", "normal.hitArr[6]"],
    ])
    expect(mapped).toEqual({
      normal: {
        hitArr: skillParam_gen.auto.slice(0, 7)
      }
    })
  })

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