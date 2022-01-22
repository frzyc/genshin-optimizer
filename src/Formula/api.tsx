import type { WeaponData } from "pipeline";
import Artifact from "../Artifact/Artifact";
import _charCurves from "../Character/expCurve_gen.json";
import { allMainStatKeys, ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKey, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { objectFromKeyMap } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { input } from "./index";
import { constant } from "./internal";
import { Data, DisplayArtifact, DisplayCharacter, DisplayWeapon, Node, ReadNode } from "./type";
import { NodeDisplay, UIData, valueString } from "./uiData";
import { data, infoMut, percent, prod, stringConst, subscript, sum } from "./utils";

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
      base: prod(input.total[base], subscript(input.talent.index[talentType], lvlMultiplier, { key: '_' })),
      move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional])
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKey,
  gen: {
    weaponTypeKey: string,
    base: { hp: number, atk: number, def: number },
    curves: { [key in string]?: string },
    ascensions: { props: { [key in string]?: number } }[]
  },
  displayChar: DisplayCharacter,
  additional: Data = {},
): Data {
  function curve(base: number, lvlCurve: string): Node {
    return prod(base, subscript(input.lvl, charCurves[lvlCurve]))
  }

  const data: Data = {
    charKey: stringConst(key),
    charEle: stringConst(element),
    weaponType: stringConst(gen.weaponTypeKey),
    premod: {},
    display: {
      character: {
        [key]: displayChar
      }
    },
  }

  let foundSpecial: boolean | undefined
  for (const stat of [...allMainStatKeys, "def" as const]) {
    const list: Node[] = []
    if (gen.curves[stat])
      list.push(curve(gen.base[stat], gen.curves[stat]!))
    const asc = gen.ascensions.some(x => x.props[stat])
    if (asc)
      list.push(subscript(input.asc, gen.ascensions.map(x => x.props[stat] ?? NaN)))

    if (!list.length) continue

    const result = infoMut(list.length === 1 ? list[0] : sum(...list), { key: stat, asConst: true })
    if (stat.endsWith("_dmg_")) result.info!.variant = stat.slice(0, -5) as any
    if (stat === "atk" || stat === "def" || stat === "hp")
      data[stat] = result
    else {
      if (foundSpecial) throw new Error("Duplicated Char Special")
      foundSpecial = true
      data.special = result
      data.premod![stat] = input.special
    }
  }

  console.log(data)
  return mergeData([data, additional])
}
function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  gen: WeaponData,
  substat2: MainStatKey | SubstatKey | undefined,
  displayWeapon: DisplayWeapon = {},
): Data {
  const result: Data = {
    base: {},
    premod: {},
    weapon: {
      key: stringConst(key), type: stringConst(type),
    },
    display: {
      weapon: {
        [key]: displayWeapon
      }
    },
  }

  const { mainStat, subStat } = gen

  const mainStatNode = infoMut(sum(prod(mainStat.base, subscript(input.weapon.lvl, weaponCurves[mainStat.curve])), subscript(input.weapon.asc, gen.ascension.map(x => x.addStats[mainStat.type] ?? 0))), { key: mainStat.type })
  result.base![mainStat.type] = mainStatNode
  result.weapon!.main = mainStatNode

  if (subStat) {
    const substatNode = subStat && infoMut(prod(subStat.base, subscript(input.weapon.lvl, weaponCurves[subStat.curve])), { key: subStat.type })
    result.premod![subStat.type] = substatNode
    result.weapon!.sub = substatNode
  }
  if (substat2) {
    const substat2Node = subscript(input.weapon.refineIndex, gen.addProps.map(x => x[substat2] ?? NaN), { key: substat2 })
    result.weapon!.sub2 = substat2Node
    result.premod![substat2] = substat2 !== subStat?.type
      ? input.weapon.sub2 : sum(input.weapon.sub, input.weapon.sub2)
  }

  return result
}
function dataObjForArtifactSheet(
  key: ArtifactSetKey,
  data: Data = {},
  displayArtifact: DisplayArtifact = {},
): Data {

  return mergeData([data, {
    display: {
      artifact: {
        [key]: displayArtifact
      }
    },
  }])
}
function dataObjForArtifact(art: ICachedArtifact, mainStatAssumptionLevel: number = 0): Data {
  const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level))
  const stats: [ArtifactSetKey | MainStatKey | SubstatKey, number][] = []
  stats.push([art.mainStatKey, mainStatVal])
  art.substats.forEach(({ key, value }) => key && stats.push([key, value]))
  return {
    art: {
      ...Object.fromEntries(stats.map(([key, value]) =>
        key.endsWith("_") ? [key, percent(value / 100)] : [key, constant(value)])),
      [art.slotKey]: {
        id: stringConst(art.id)
      },
    },
    artSet: {
      [art.setKey]: constant(1)
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
          return percent(0.1)
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
      refinement: constant(weapon.refinement),
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
  dataObjForCharacterSheet, dataObjForWeaponSheet, dataObjForArtifactSheet,
  dmgNode,

  mergeData, computeUIData, valueString,
};
