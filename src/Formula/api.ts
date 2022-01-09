import { ICachedArtifact } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { ICachedWeapon } from "../Types/weapon";
import { constant } from "./internal";
import { Data, Node } from "./type";
import { stringConst } from "./utils";

function dataObjForArtifactSheets(/** ARG negotiable */): Data {
  return { number: {}, string: {} }
}
function dataObjForCharacterSheet(/** ARG negotiable */): Data {
  return { number: {}, string: {} }
}
function dataObjForWeaponSheet(/** ARG negotiable */): Data {
  return { number: {}, string: {} }
}
function dataObjForArtifact(art: ICachedArtifact): Data {
  return {
    number: {
      art: {
        [art.mainStatKey]: constant(art.mainStatVal),
        ...Object.fromEntries(art.substats
          .filter((x) => x.key)
          .map(({ key, value }) => [key, constant(value)])),
        [art.setKey]: constant(1),
      },
    }, string: {}
  }
}
function dataObjForCharacter(char: ICachedCharacter): Data {
  return {
    number: {
      char: {
        level: constant(char.level),
        constellation: constant(char.constellation),
        ascension: constant(char.ascension),

        auto: constant(char.talent.auto),
        skill: constant(char.talent.skill),
        burst: constant(char.talent.burst),
      },
      // TODO: Add conditional values
    },
    string: {
      char: {
        key: stringConst(char.key),
        element: stringConst(char.elementKey ?? "anemo"), // TODO: Check if can be null
      },
    },
  }
}
function dataObjForWeapon(weapon: ICachedWeapon, type: "bow" | "catalyst" | "claymore" | "polearm" | "sword"): Data {
  return {
    number: {
      weapon: {
        level: constant(weapon.level),
        ascension: constant(weapon.ascension),
        refinement: constant(weapon.refinement),
      },
    }, string: {
      weapon: {
        key: stringConst(weapon.key),
        type: stringConst(type),
      },
    },
  }
}

function mergeData(data: Data[]): Data {
  return { number: {}, string: {} }
}
function computeData(data: Data): ComputedValues {
  return {
    number: {
      total: {
        atk: 100,
      }
    },
    string: {

    }
  }
}
function displaysFromNodes(nodes: Data, values: ComputedValues): NodeDisplays {
  return {
    total: {
      atk: {
        operation: "add",
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
  number: ComputedNumValues
  string: ComputedStringValues
}
export interface ComputedNumValues {
  [key: string]: typeof key extends "operation" ? undefined : ComputedNumValues | number
}
export interface ComputedStringValues {
  [key: string]: typeof key extends "operation" ? undefined : ComputedStringValues | number
}
export interface NodeDisplays {
  [key: string]: typeof key extends "operation" ? undefined : NodeDisplays | NodeDisplay
}

interface NodeDisplay {
  /** structure negotiable */
  operation: Node["operation"]
  name: Displayable
  formulas: Displayable[]
}
