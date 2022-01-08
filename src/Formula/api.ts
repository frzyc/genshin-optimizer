import { ICachedArtifact } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { ICachedWeapon } from "../Types/weapon";
import { Data } from "./type";

function dataObjForArtifactSheets(/** ARG negotiable */): Data {
  return { formula: {}, string: {} }
}
function dataObjForCharacterSheet(/** ARG negotiable */): Data {
  return { formula: {}, string: {} }
}
function dataObjForWeaponSheet(/** ARG negotiable */): Data {
  return { formula: {}, string: {} }
}
function dataObjForArtifact(value: ICachedArtifact): Data {
  return { formula: {}, string: {} }
}
function dataObjForCharacter(value: ICachedCharacter): Data {
  return { formula: {}, string: {} }
}
function dataObjForWeapon(value: ICachedWeapon): Data {
  return { formula: {}, string: {} }
}

function mergeData(data: Data[]): Data {
  return { formula: {}, string: {} }
}
function computeData(data: Data): ComputedValues {
  return {
    total: {
      atk: 100,
    }
  }
}
function displaysFromNodes(nodes: Data, values: ComputedValues): NodeDisplays {
  return {
    total: {
      atk: {
        name: "Total ATK",
        formulas: [
          "TotalATK = baseATK + ...",
          "BaseATK = char atk + ...",
        ]
      }
    }
  }
}

export interface ComputedValues {
  [key: string]: typeof key extends "operation" ? undefined : ComputedValues | number
}
export interface NodeDisplays {
  [key: string]: typeof key extends "operation" | "names" ? undefined : NodeDisplays | NodeDisplay
}

interface NodeDisplay {
  /** structure negotiable */
  name: Displayable
  formulas: Displayable[]
}
