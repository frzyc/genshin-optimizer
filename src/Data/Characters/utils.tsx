import { Translate } from "../../Components/Translate";
import { NumNode } from "../../Formula/type";
import { infoMut } from "../../Formula/utils";
import { CharacterKey } from "../../Types/consts";
import { trans } from "../SheetUtil";
import { dmgNode } from "./dataUtil";

type ComboRange = [number, number]

/**
 * Normal hit array
 * @param normals The aray of hit dmg arrays for normal attacks
 * @param combo Indices to be grouped as part of a multihit combo
 */
export function mapNormals(normals: number[][], combos: ComboRange[], characterKey: CharacterKey) {
  const [tr] = trans("char", characterKey)
  const formula: Record<number, NumNode> = Object.fromEntries(normals.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")]))
  const display:{
    normalIndex: number,
    autoNumber: number, 
    comboNumber?: number, 
    comboMultiplier?: number
  }[] = []

  let autoNumber = 0
  let combo: ComboRange | null = null
  for (let normalIndex = 0; normalIndex < normals.length; normalIndex++) {
    const comboStart = combos.find(([start, _]) => start === normalIndex)
    const comboEnd = combos.find(([_, end]) => end === normalIndex)
    if (comboStart) combo = comboStart
    if (comboEnd) combo = null

    let comboMultiplier: number | undefined = undefined
    let comboNumber: number | undefined = undefined
    if (combo !== null) {
      const [start, end] = combo
      if (normalIndex === start) {
        const comboNormals = normals.slice(start, end)
        const areAllDuplicates = comboNormals.every((arr, i) => arr.every((v, j) => v === comboNormals[0][j]))
        if (areAllDuplicates) {
          // skip duplicates, set multiplier on current entry
          // console.log({areAllDuplicates, combo, comboNormals})
          comboMultiplier = end - start
          normalIndex = end
          combo = null
        }
      }
      if (!comboMultiplier) {
        comboNumber = normalIndex - start + 1
      }
    } 
    display.push({ normalIndex, autoNumber, comboMultiplier, comboNumber })
    if (combo === null) autoNumber++
    // else if (comboMultiplier) {
    //   normalIndex = combo[1]
    //   combo = null
    // }
  }

  const section = {
    text: tr("auto.fields.normal"),
    fields: display.map(({normalIndex, autoNumber, comboMultiplier, comboNumber}) => {
      let textSuffix = ''
      if (comboMultiplier) {
        textSuffix = `(${comboMultiplier} Hits)`
      } else if (comboNumber) {
        textSuffix = `(${comboNumber})`
      }

      return ({
        node: infoMut(formula[normalIndex], { key: `char_${characterKey}_gen:auto.skillParams.${autoNumber}` }),
        textSuffix
      })
    })
  }

  return {formula, section}
}