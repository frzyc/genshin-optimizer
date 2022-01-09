import { input } from "./index";
import { allMainStatKeys, allSubstats, ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { ICachedWeapon } from "../Types/weapon";
import { constant } from "./internal";
import { Data, Node } from "./type";
import { stringConst, subscript, sum } from "./utils";
import { CharacterKey, ElementKey, ElementKeyWithPhy } from "../Types/consts";

function dataObjForArtifactSheets(): Data {
  const result = {
    number: {
      premod: {
        ...Object.fromEntries([...allSubstats, ...allMainStatKeys]
          .filter(key => key !== "hp_" && key !== "atk_" && key != "def_")
          .map(key =>
            [key, input.art[key]]))
      },
      // TODO: Add Artifact set effects
    }, string: {}
  }

  return result
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKeyWithPhy | undefined,
  hp: [offset: number, curve: number[]],
  atk: [offset: number, curve: number[]],
  def: [offset: number, curve: number[]],
  special: [offset: number, curve: number[], stat: MainStatKey | SubstatKey],
  additional: Data["number"] = {},
): Data {
  return {
    number: {
      base: {
        hp: sum(hp[0], subscript(input.char.level, hp[1])),
        atk: sum(atk[0], subscript(input.char.level, atk[1])),
        def: sum(def[0], subscript(input.char.level, def[1])),
        [special[2]]: sum(special[0], subscript(input.char.level, special[1])),
      },
      preMod: {
        critRate_: constant(0.05),
        critDMG_: constant(0.5),
        enerRech_: constant(1),
      }
      // TODO: include `additional`
    }, string: {
      char: {
        key: stringConst(key),
        ...(element ? { element: stringConst(element) } : {}),
      }
    }
  }
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
