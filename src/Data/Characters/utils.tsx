import { NumNode } from "../../Formula/type";
import { infoMut } from "../../Formula/utils";
import { CharacterKey } from "../../Types/consts";
import { IFieldDisplay } from "../../Types/IFieldDisplay_WR";
import { trans } from "../SheetUtil";
import { damageTemplate } from "./CharacterSheet";


type ComboRange = [number, number]
type Multiplier = [number, number]

/**
 * Normal hit array
 * @param normals The aray of hit dmg arrays for normal attacks
 * @param combo Indices to be grouped as part of a multihit combo
 */
export function normalSection(characterKey: CharacterKey, normals: number[][], formula: Record<number, NumNode>, combos?: ComboRange[], multipliers?: Multiplier[]) {
  const [tr] = trans("char", characterKey)
  const display: {
    normalIndex: number,
    autoNumber: number,
    comboNumber?: number,
    comboMultiplier?: number
  }[] = []

  let autoNumber = 0
  let combo: ComboRange | null = null
  for (let normalIndex = 0; normalIndex < normals.length; normalIndex++) {
    const comboStart = combos?.find(([start, _]) => start === normalIndex)
    const comboEnd = combos?.find(([_, end]) => end === normalIndex)
    if (comboStart) combo = comboStart
    if (comboEnd) combo = null

    let entry: typeof display[number] = {
      normalIndex,
      autoNumber
    }

    if (combo !== null) {
      const [start, end] = combo
      if (normalIndex === start) {
        const comboNormals = normals.slice(start, end)
        const areAllDuplicates = comboNormals.every((arr, i) => arr.every((v, j) => v === comboNormals[0][j]))
        if (areAllDuplicates) {
          // skip duplicates, set multiplier on current entry
          entry.comboMultiplier = end - start
          normalIndex = end - 1
          combo = null
        }
      }
      if (!entry.comboMultiplier) {
        entry.comboNumber = normalIndex - start + 1
      }
      if (normalIndex === end - 1) {
        autoNumber++
      }
    } else {
      autoNumber++
    }

    const multiplier = multipliers?.find(([index, _]) => index === normalIndex)
    if (multiplier) {
      const [_, comboMultiplier] = multiplier
      entry.comboMultiplier = comboMultiplier
    }

    display.push(entry)
  }

  const section = {
    text: tr("auto.fields.normal"),
    fields: display.map(({ normalIndex, autoNumber, comboMultiplier, comboNumber }) => 
      damageTemplate(formula[normalIndex], `char_${characterKey}_gen`, `auto.skillParams.${autoNumber}`, { comboMultiplier, comboNumber })
    )
  }

  return section
}