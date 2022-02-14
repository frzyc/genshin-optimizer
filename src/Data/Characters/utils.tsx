import { Translate } from "../../Components/Translate";
import { NumNode } from "../../Formula/type";
import { infoMut } from "../../Formula/utils";
import { CharacterKey } from "../../Types/consts";
import { trans } from "../SheetUtil";
import { dmgNode } from "./dataUtil";


/**
 * Normal hit array
 * @param normals The aray of hit dmg arrays for normal attacks
 * @param combo Inices to be grouped as part of a multihit combo
 */
export function mapNormals(normals: number[][], combos: number[][], characterKey: CharacterKey) {
  const [tr] = trans("char", characterKey)
  const formula: Record<number, NumNode> = Object.fromEntries(normals.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")]))
  const section = {
    text: tr("auto.fields.normal"),
    fields: normals.map((_, normalIndex) => {
      let textSuffix = ""
      for (const combo of combos) {
        const comboIndex = combo.findIndex(v => v === normalIndex)
        const comboNumber = comboIndex + 1
        if (comboNumber) {
          textSuffix = `(${comboNumber})`
          break
        }
      }

      let autoNumber = combos.reduce((prev, curr) => {
          // Subtracts the # normals that did not count towards the auto number
          // because they were part of a combo
          const countLessThan = curr.reduce((sum, comboNormalIndex) => {
            if (comboNormalIndex <= normalIndex) {
              return sum + 1
            }
            return sum
          }, 0)

          if (countLessThan) {
            return prev - (countLessThan - 1)
          } 

          return prev
      }, normalIndex)

      return ({
        node: infoMut(formula[normalIndex], { key: `char_${characterKey}_gen:auto.skillParams.${autoNumber}` }),
        textSuffix
      })
    })
  }

  return {formula, section}
}