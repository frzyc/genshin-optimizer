import { input } from "../../Formula";
import { mergeData, reactions } from "../../Formula/api";
import { Data, DisplaySub, NumNode } from "../../Formula/type";
import { constant, data, infoMut, prod, subscript, sum } from "../../Formula/utils";
import { allMainStatKeys, allSubstats, MainStatKey } from "../../Types/artifact";
import { CharacterKey, ElementKey, Region } from "../../Types/consts";
import { layeredAssignment, objectKeyMap, objectMap } from "../../Util/Util";
import _charCurves from "./expCurve_gen.json";

export const absorbableEle = ["hydro", "pyro", "cryo", "electro"] as ElementKey[]

// TODO: Remove this conversion after changing the file format
const charCurves = objectMap(_charCurves, value => [0, ...Object.values(value)])

const commonBasic = objectKeyMap([...allSubstats, "def"], key => input.total[key])
commonBasic.critRate_ = input.total.cappedCritRate

function getTalentType(move: "normal" | "charged" | "plunging" | "skill" | "burst") {
  switch (move) {
    case "normal": case "charged": case "plunging": return "auto";
    case "skill": return "skill";
    case "burst": return "burst";
  }
}

export function singleDmgNode(base: MainStatKey, multiplier: number, move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): NumNode {
  return data(input.hit.dmg, mergeData([{
    hit: {
      base: prod(input.total[base], multiplier,),
      move: constant(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional]))
}

export function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): NumNode {
  const talentType = getTalentType(move)
  return data(input.hit.dmg, mergeData([{
    hit: {
      base: prod(input.total[base], subscript(input.total.talent[talentType], lvlMultiplier, { key: '_' })),
      move: constant(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional]))
}
export function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKey | undefined,
  region: Region | undefined,
  gen: {
    weaponTypeKey: string,
    base: { hp: number, atk: number, def: number },
    curves: { [key in string]?: string },
    ascensions: { props: { [key in string]?: number } }[]
  },
  display: { [key: string]: DisplaySub },
  additional: Data = {},
): Data {
  function curve(base: number, lvlCurve: string): NumNode {
    return prod(base, subscript(input.lvl, charCurves[lvlCurve]))
  }
  display.basic = { ...commonBasic }
  const data: Data = {
    charKey: constant(key),
    base: {},
    weaponType: constant(gen.weaponTypeKey),
    premod: {},
    display,
  }
  if (element) {
    data.charEle = constant(element)
    data.teamBuff = { tally: { [element]: constant(1) } }
    data.display!.basic[`${element}_dmg_`] = input.total[`${element}_dmg_`]
    data.display!.reaction = reactions[element]
  }
  if (region)
    layeredAssignment(data, ["teamBuff", "tally", region], constant(1))
  if (gen.weaponTypeKey !== "catalyst") {
    if (!data.display!.basic) data.display!.basic = {}
    data.display!.basic!.physical_dmg_ = input.total.physical_dmg_
  }

  let foundSpecial: boolean | undefined
  for (const stat of [...allMainStatKeys, "def" as const]) {
    const list: NumNode[] = []
    if (gen.curves[stat])
      list.push(curve(gen.base[stat], gen.curves[stat]!))
    const asc = gen.ascensions.some(x => x.props[stat])
    if (asc)
      list.push(subscript(input.asc, gen.ascensions.map(x => x.props[stat] ?? NaN)))

    if (!list.length) continue

    const result = infoMut(list.length === 1 ? list[0] : sum(...list), { key: stat, prefix: "char", asConst: true })
    if (stat.endsWith("_dmg_")) result.info!.variant = stat.slice(0, -5) as any
    if (stat === "atk" || stat === "def" || stat === "hp")
      data.base![stat] = result
    else {
      if (foundSpecial) throw new Error("Duplicated Char Special")
      foundSpecial = true
      data.special = result
      data.premod![stat] = input.special
    }
  }

  return mergeData([data, additional])
}
