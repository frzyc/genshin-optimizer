import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { crawlObject, layeredAssignment, objectFromKeyMap } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { input, NumInput, str, StrictNumInput, StrictStringInput, StringInput } from "./index";
import { constant } from "./internal";
import { Data, DynamicNumInput, Node, ReadNode, StringNode, StringReadNode } from "./type";
import { data, prod, stringConst, subscript, sum } from "./utils";
const readNodeArrays: ReadNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readNodeArrays.push(x))

// TODO: Remove this conversion
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

const readInputArray: Node[] = [], stringInputArray: StringNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readInputArray.push(x))
crawlObject(str, [], (x: any) => x.operation, (x: any) => stringInputArray.push(x))

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
  hp: { base: number, lvlCurve: string, asc: number[] },
  atk: { base: number, lvlCurve: string, asc: number[] },
  def: { base: number, lvlCurve: string, asc: number[] },
  special: { stat: MainStatKey | SubstatKey, asc: number[] },
  display: Data["number"]["display"],
  additional: Data["number"] = {},
): Data {
  function curve(array: { base: number, lvlCurve: string, asc: number[] }): Node {
    return sum(prod(array.base, subscript(input.char.lvl, charCurves[array.lvlCurve])), subscript(input.char.asc, array.asc))
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
  mainStat: { stat?: "atk", base: number, lvlCurve: string, asc: number[] },
  substat: { stat: MainStatKey | SubstatKey, base: number, lvlCurve: string },
  substat2: { stat: MainStatKey | SubstatKey, refinement: number[] } | undefined,
  additional: Data["number"] = {},
): Data {
  const mainStatNode = sum(prod(mainStat.base, subscript(input.weapon.lvl, weaponCurves[mainStat.lvlCurve])), subscript(input.weapon.asc, mainStat.asc))
  const substatNode = prod(substat.base, subscript(input.weapon.lvl, weaponCurves[substat.lvlCurve]))
  const substat2Node = substat2 && subscript(input.weapon.refineIndex, substat2.refinement)

  const result: Data = {
    number: {
      base: { [mainStat.stat ?? "atk"]: mainStatNode },
      premod: {
        [substat.stat]: substatNode,
      },
      weapon: {
        main: mainStatNode, sub: substatNode,
      }
    }, string: {
      weapon: {
        key: stringConst(key),
        type: stringConst(type),
        main: stringConst(mainStat.stat ?? "atk"),
        sub: stringConst(substat.stat),
      }
    }
  }

  if (substat2) {
    result.string.weapon!.sub2 = stringConst(substat2.stat)
    result.number.weapon!.sub2 = substat2Node
    result.number.premod![substat2.stat] = substat2.stat !== substat.stat
      ? substat2Node : sum(substatNode, substat2Node!)
  }

  result.number = mergeDataComponents([result.number, additional], input)
  return result
}
function dataObjForArtifact(art: ICachedArtifact, assumingMinimumMainStatLevel: number): Data {
  // TODO: assume main stat level
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
      // TODO: override enemy stats
      enemy: {
        res: {
          ...objectFromKeyMap(allElementsWithPhy, _ => {
            return constant(0.1)
          }),
        },
        level: constant(char.level),
      },
      conditional: {
        // TODO: Add conditional values
      }
    },
    string: {
      char: {
        // TODO: Check when char.elementKey can be null
        ...(char.elementKey ? { ele: stringConst(char.elementKey) } : {})
      },
      dmg: {
        hitMode: stringConst(char.hitMode)
      }
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
        if (data.length > 1) throw `Found multiple entries for unique read node ${readNode.key}`
        else return data[0]

      return { ...readNode, operation: accumulation, operands: data }
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
function computeUIData(data: Data[]): UIData {
  const thresholds: Dict<string, Dict<number, { path: string[], value: NodeDisplay }>> = {}
  const number = {}
  const string = {}

  const niceDisplay: NodeDisplay = {
    operation: "read",
    name: "Nice property 69",
    variant: "physical",
    value: 69,
    formulas: [
      "Nice = nice + nice2",
      "nice1 = nice2 + nice3",
    ]
  }
  const niceResult: UIData = {
    number: {} as any,
    string: {} as any,
    threshold: {
      art: {
        EmblemOfSeveredFate: {
          2: {
            premod: {
              enerRech_: 0.2 // 20%
            },
          },
          4: {
            dmgBonus: {
              burst: 69 // nice
            }
          }
        }
      }
    }
  }
  crawlObject(input, [], (x: any) => x.operation, (x: any, key: string[]) => layeredAssignment(niceResult.number, key, x))
  crawlObject(str, [], (x: any) => x.operation, (x: any, key: string[]) => layeredAssignment(niceResult.string, key, x))
  for (const entry of data) {
    if (entry.number.conditional) {
      crawlObject(entry.number.conditional, ["conditional"], (x: any) => x.operation, (x: any, key: string[]) => layeredAssignment(niceResult.number, key, x))
    }
  }

  return niceResult
}

interface UIData {
  number: StrictNumInput<NodeDisplay> & DynamicNumInput<NodeDisplay>
  string: StrictStringInput<string>
  threshold: NumInput<Dict<1 | 2 | 4, NumInput<number>>> // How this type works, we might never know
}
export interface NodeDisplay {
  /** structure negotiable */
  operation: Node["operation"]
  name: Displayable
  value: number
  variant: ElementKeyWithPhy | "healing"
  formulas: Displayable[]
}

export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeUIData,
}
