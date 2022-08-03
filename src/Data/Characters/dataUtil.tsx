import { SubstatKey } from "pipeline";
import { input } from "../../Formula";
import { inferInfoMut, mergeData } from "../../Formula/api";
import { reactions } from "../../Formula/reaction";
import { Data, DisplaySub, NumNode } from "../../Formula/type";
import { constant, data, infoMut, lookup, none, one, percent, prod, stringPrio, subscript, sum, unequalStr } from "../../Formula/utils";
import { allMainStatKeys, MainStatKey } from "../../Types/artifact";
import { CharacterKey, ElementKey, Region } from "../../Types/consts";
import { layeredAssignment, objectKeyMap, objectMap } from "../../Util/Util";
import _charCurves from "./expCurve_gen.json";

// TODO: Remove this conversion after changing the file format
const charCurves = objectMap(_charCurves, value => [0, ...Object.values(value)])

const commonBasic = objectKeyMap(["hp", "atk", "def", "eleMas", "enerRech_", "critRate_", "critDMG_", "heal_"], key => input.total[key])

export const infusionNode = stringPrio(
  input.infusion.nonOverridableSelf,
  unequalStr(input.infusion.team, none, input.infusion.team),
  input.infusion.overridableSelf)
const inferredHitEle = stringPrio(
  lookup(input.hit.move, {
    "skill": input.charEle, "burst": input.charEle,
  }, undefined),
  lookup(input.weaponType, {
    sword: infusionNode, claymore: infusionNode, polearm: infusionNode,
    catalyst: input.charEle,
  }, undefined),
  "physical"
)

function getTalentType(move: "normal" | "charged" | "plunging" | "skill" | "burst") {
  switch (move) {
    case "normal": case "charged": case "plunging": return "auto";
    case "skill": return "skill";
    case "burst": return "burst";
  }
}

/** Note: `additional` applies only to this formula */
export function customDmgNode(base: NumNode, move: "normal" | "charged" | "plunging" | "skill" | "burst" | "elemental", additional: Data = {}): NumNode {
  return data(input.hit.dmg, mergeData([{
    hit: { base, move: constant(move), ele: additional?.hit?.ele ? undefined : inferredHitEle },
  }, additional]))
}
/** Note: `additional` applies only to this formula */
export function customShieldNode(base: NumNode, additional?: Data): NumNode {
  const shieldNode = prod(base, sum(one, input.total.shield_))
  return additional ? data(shieldNode, additional) : shieldNode
}
/** Note: `additional` applies only to this formula */
export function customHealNode(base: NumNode, additional?: Data): NumNode {
  const healInc = input.total.healInc
  const healNode = prod(sum(base, healInc), sum(one, input.total.heal_, input.total.incHeal_))

  return additional ? data(healNode, additional) : healNode
}
/** Note: `additional` applies only to this formula */
export function dmgNode(base: MainStatKey | SubstatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): NumNode {
  const talentType = getTalentType(move)
  return customDmgNode(prod(subscript(input.total[`${talentType}Index`], lvlMultiplier, { key: '_' }), input.total[base]), move, additional)
}
/** Note: `additional` applies only to this formula */
export function shieldNode(base: MainStatKey | SubstatKey, percent: NumNode | number, flat: NumNode | number, additional?: Data): NumNode {
  return customShieldNode(sum(prod(percent, input.total[base]), flat), additional)
}
/** Note: `additional` applies only to this formula */
export function healNode(base: MainStatKey | SubstatKey, percent: NumNode | number, flat: NumNode | number, additional?: Data): NumNode {
  return customHealNode(sum(prod(percent, input.total[base]), flat), additional)
}
/** Note: `additional` applies only to this formula */
export function shieldNodeTalent(base: MainStatKey | SubstatKey, baseMultiplier: number[], flat: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional?: Data): NumNode {
  const talentType = getTalentType(move)
  const talentIndex = input.total[`${talentType}Index`]
  return customShieldNode(sum(
    prod(subscript(talentIndex, baseMultiplier, { key: '_' }), input.total[base]),
    subscript(talentIndex, flat)
  ), additional)
}
export function shieldElement(element: "electro" | "cryo" | "hydro" | "pyro" | "geo", shieldNode: NumNode) {
  return infoMut(prod(percent(element === "geo" ? 1.5 : 2.5), shieldNode), { variant: element })
}
/** Note: `additional` applies only to this formula */
export function healNodeTalent(base: MainStatKey | SubstatKey, baseMultiplier: number[], flat: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional?: Data): NumNode {
  const talentType = getTalentType(move)
  const talentIndex = input.total[`${talentType}Index`]
  return customHealNode(sum(
    prod(subscript(talentIndex, baseMultiplier, { key: '_' }), input.total[base]),
    subscript(talentIndex, flat)
  ), additional)
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

  return mergeData([data, inferInfoMut(additional)])
}
