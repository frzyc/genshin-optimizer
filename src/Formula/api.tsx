import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKey, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { objectFromKeyMap } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { input } from "./index";
import { constant } from "./internal";
import { Data, Node, ReadNode } from "./type";
import { NodeDisplay, UIData, valueString } from "./uiData";
import { data, percent, prod, stringConst, subscript, sum } from "./utils";

// TODO: Remove this conversion after changing the file format
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): Node {
  let talentType: "auto" | "skill" | "burst"
  switch (move) {
    case "normal": case "charged": case "plunging": talentType = "auto"; break
    case "skill": talentType = "skill"; break
    case "burst": talentType = "burst"; break
  }
  return data(input.hit.dmg, [{
    hit: {
      base: prod(input.total[base], subscript(input.talent.total[talentType], lvlMultiplier, { key: '_' })),
      move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional])
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKey,
  weaponType: WeaponTypeKey,
  hp: { base: number, lvlCurve: string, asc: number[] },
  atk: { base: number, lvlCurve: string, asc: number[] },
  def: { base: number, lvlCurve: string, asc: number[] },
  special: { stat: MainStatKey | SubstatKey, asc: number[] },
  display: Data["display"],
  additional: Data = {},
): Data {
  function curve(array: { base: number, lvlCurve: string, asc: number[] }): Node {
    return sum(prod(array.base, subscript(input.lvl, charCurves[array.lvlCurve])), subscript(input.asc, array.asc))
  }

  const result = mergeData([{
    charKey: stringConst(key),
    charEle: stringConst(element),
    weaponType: stringConst(weaponType),
    hp: curve(hp), atk: curve(atk), def: curve(def),
    special: subscript(input.asc, special.asc, { key: special.stat }),
    premod: {
      [special.stat]: input.special,
    },
    display,
  }, additional])
  return result
}
function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  mainStat: { stat?: "atk", base: number, lvlCurve: string, asc: number[] },
  substat: { stat: MainStatKey | SubstatKey, base: number, lvlCurve: string },
  substat2: { stat: MainStatKey | SubstatKey, refinement: number[] } | undefined,
  additional: Data = {},
): Data {
  const mainStatNode = sum(prod(mainStat.base, subscript(input.weapon.lvl, weaponCurves[mainStat.lvlCurve])), subscript(input.weapon.asc, mainStat.asc))
  const substatNode = prod(substat.base, subscript(input.weapon.lvl, weaponCurves[substat.lvlCurve]))
  const substat2Node = substat2 && subscript(input.weapon.refineIndex, substat2.refinement, { key: substat2.stat })

  mainStatNode.info = { key: mainStat.stat ?? "atk" }
  substatNode.info = { key: substat.stat }
  if (substat2Node)
    substat2Node.info = { key: substat2.stat }

  const result: Data = {
    base: { [mainStat.stat ?? "atk"]: input.weapon.main },
    premod: { [substat.stat]: input.weapon.sub },
    weapon: {
      key: stringConst(key), type: stringConst(type),
      main: mainStatNode, sub: substatNode,
    },
  }

  if (substat2) {
    result.weapon!.sub2 = substat2Node
    result.premod![substat2.stat] = substat2.stat !== substat.stat
      ? input.weapon.sub2 : sum(input.weapon.sub, input.weapon.sub2)
  }

  return mergeData([result, additional])
}
function dataObjForArtifact(art: ICachedArtifact, assumingMinimumMainStatLevel: number = 0): Data {
  // TODO: assume main stat level
  const stats: [ArtifactSetKey | MainStatKey | SubstatKey, number][] = []
  stats.push([art.mainStatKey, art.mainStatVal])
  art.substats.forEach(({ key, value }) => key && stats.push([key, value]))
  return {
    art: {
      ...Object.fromEntries(stats.map(([key, value]) =>
        key.endsWith("_") ? [key, percent(value / 100)] : [key, constant(value)])),
      [art.slotKey]: {
        id: stringConst(art.id)
      },
    }
  }
}
function dataObjForCharacter(char: ICachedCharacter): Data {
  return {
    lvl: constant(char.level),
    constellation: constant(char.constellation),
    asc: constant(char.ascension),

    // TODO: Check when char.elementKey can be null
    charEle: char.elementKey ? stringConst(char.elementKey) : undefined,

    talent: {
      base: {
        auto: constant(char.talent.auto),
        skill: constant(char.talent.skill),
        burst: constant(char.talent.burst),
      }
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
    },
    hit: {
      hitMode: stringConst(char.hitMode)
    }
  }
}
function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    weapon: {
      lvl: constant(weapon.level),
      asc: constant(weapon.ascension),
      refineIndex: constant(weapon.refinement - 1),
    },
  }
}
function mergeData(data: Data[]): Data {
  function internal(data: any[], input: any, path: string[]): any {
    if (data.length === 1) return data[0]
    if (input.operation) {
      const accumulation = (input as ReadNode).accumulation ?? "unique"
      if (accumulation === "unique") {
        if (data.length !== 1) throw new Error("Multiple entries when merging `unique`")
        return data[0]
      }
      const result: Node = { operation: accumulation, operands: data, }
      return result
    } else {
      return Object.fromEntries([...new Set(data.flatMap(x => Object.keys(x) as string[]))]
        .map(key => [key, internal(data.map(x => x[key]).filter(x => x), input[key], [...path, key])]))
    }
  }

  return data.length ? internal(data, input, []) : {}
}

function computeUIData(data: Data[]): UIData {
  return new UIData(data, undefined)
}

export type { NodeDisplay, UIData };
export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeUIData, valueString,
};
