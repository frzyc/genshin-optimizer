import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { CharacterKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { common, input, NumInput, str, StringInput } from "./index";
import { constant } from "./internal";
import { Data, Node, ReadNode, StringReadNode } from "./type";
import { data, prod, stringConst, subscript, sum } from "./utils";

// TODO: Remove this conversion
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

function dataObjForArtifactSheets(): Data {
  // TODO: Add Artifact set effects
  return {
    number: {
      premod: {
        hp: input.art.hp,
        atk: input.art.atk,
        def: input.art.def,
        eleMas: input.art.eleMas,
        enerRech_: input.art.enerRech_,
        critRate_: input.art.critRate_,
        critDMG_: input.art.critDMG_,
        heal_: input.art.heal_,

        physical_dmg_: input.art.physical_dmg_,
        anemo_dmg_: input.art.anemo_dmg_,
        geo_dmg_: input.art.geo_dmg_,
        electro_dmg_: input.art.electro_dmg_,
        hydro_dmg_: input.art.hydro_dmg_,
        pyro_dmg_: input.art.pyro_dmg_,
        cryo_dmg_: input.art.cryo_dmg_,
      },
    }, string: {}
  }
}
function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data["number"] = {}): Node {
  return data(input.hit.dmg, [{
    number: {
      hit: {
        base: prod(input.total[base], subscript(input.char.lvl, lvlMultiplier)),
      },
    }, string: {
      dmg: {
        move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
      },
    }
  }, ...(Object.keys(additional).length ? [{ number: additional, string: {} }] : [])])
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKeyWithPhy | undefined,
  hp: { offset: number, lvlCurve: string, asc: number[] },
  atk: { offset: number, lvlCurve: string, asc: number[] },
  def: { offset: number, lvlCurve: string, asc: number[] },
  special: { asc: number[], stat: MainStatKey | SubstatKey },
  display: Data["number"]["display"],
  additional: Data["number"] = {},
): Data {
  function curve(array: { offset: number, lvlCurve: string, asc: number[] }): Node {
    return sum(array.offset, subscript(input.char.lvl, charCurves[array.lvlCurve]), subscript(input.char.asc, array.asc))
  }

  return {
    number: mergeDataComponents([{
      base: {
        hp: curve(hp), atk: curve(atk), def: curve(def),
        [special.stat]: subscript(input.char.asc, special.asc),
      },
      display,
    }, additional], input), string: {
      char: {
        key: stringConst(key),
        ...(element ? { element: stringConst(element) } : {}),
      }
    }
  }
}
function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  stats: { stat: MainStatKey | SubstatKey, offset?: number, lvlCurve?: string, refinement?: number[], asc?: number[] }[],
  additional: Data["number"] = {},
): Data {
  const result: Data = {
    number: {}, string: {
      weapon: {
        key: stringConst(key),
        type: stringConst(type),
      }
    }
  }

  for (const { stat, offset, lvlCurve, refinement, asc } of stats) {
    const nodes: Node[] = []
    if (offset) nodes.push(constant(offset))
    if (lvlCurve) nodes.push(subscript(input.weapon.lvl, weaponCurves[lvlCurve]))
    if (refinement) nodes.push(subscript(input.weapon.refineIndex, refinement))
    if (asc) nodes.push(subscript(input.weapon.asc, asc))

    if (nodes.length === 0) continue
    if (nodes.length === 1) result.number[stat] = nodes[0]
    else result.number[stat] = sum(...nodes)
  }

  result.number = mergeDataComponents([result.number, additional], input)
  return result
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
        lvl: constant(char.level),
        constellation: constant(char.constellation),
        asc: constant(char.ascension),

        auto: constant(char.talent.auto),
        skill: constant(char.talent.skill),
        burst: constant(char.talent.burst),
      },
      conditional: {
        // TODO: Add conditional values
      }
    },
    string: {
      char: {
        key: stringConst(char.key),
        // TODO: Check when char.elementKey can be null
        ...(char.elementKey ? { element: stringConst(char.elementKey) } : {})
      },
    },
  }
}
function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    number: {
      weapon: {
        lvl: constant(weapon.level),
        asc: constant(weapon.ascension),
        refineIndex: constant(weapon.refinement - 1),
      },
    }, string: {}
  }
}

function mergeDataComponents<T extends Data["number" | "string"]>(data: T[], readNodes: any): T {
  data = data.filter(data => Object.keys(data).length)
  if (data.length <= 1) return data[0] ?? {}

  function internal(data: any[], readNodes: any): any {
    if (data.length <= 1) return data[0]

    if (readNodes.operation) {
      // Found leaf
      const readNode = readNodes as ReadNode | StringReadNode
      const accumulation = readNode.accumulation ?? "unique"

      if (accumulation === "unique")
        if (data.length > 1) throw "Found multiple entries for unique read node"
        else return data[0]

      return { ...readNode, accumulation, operands: data }
    }

    return Object.fromEntries([...new Set(data.flatMap(x => Object.keys(x)) as string[])]
      .map(key => [key, internal(data.filter(data => data[key]).map(data => data[key]), readNodes[key])]))
  }

  return internal(data, readNodes)
}
function mergeData(...data: Data[]): Data {
  return {
    number: mergeDataComponents(data.map(x => x.number), input),
    string: mergeDataComponents(data.map(x => x.string), str),
  }
}
function computeData(data: Data[]): ComputedValues {
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
function displaysFromNodes(nodes: Data, values: ComputedValues): NumInput<NodeDisplay> {
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
  number: NumInput<number>
  string: StringInput<string>
}

export interface NodeDisplay {
  /** structure negotiable */
  operation: Node["operation"]
  name: Displayable
  formulas: Displayable[]
}

export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForArtifactSheets, dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeData, displaysFromNodes,
}
