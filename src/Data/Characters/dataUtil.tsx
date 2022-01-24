import _charCurves from "../../Character/expCurve_gen.json";
import { allMainStatKeys, MainStatKey } from "../../Types/artifact";
import { CharacterKey, ElementKey } from "../../Types/consts";
import { input } from "../../Formula/index";
import { Data, DisplayCharacter, Node } from "../../Formula/type";
import { data, infoMut, prod, stringConst, subscript, sum } from "../../Formula/utils";
import { mergeData, reactions } from "../../Formula/api";

export const absorbableEle = ["hydro", "pyro", "cryo", "electro"] as ElementKey[]

// TODO: Remove this conversion after changing the file format
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

export function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): Node {
  let talentType: "auto" | "skill" | "burst"
  switch (move) {
    case "normal": case "charged": case "plunging": talentType = "auto"; break
    case "skill": talentType = "skill"; break
    case "burst": talentType = "burst"; break
  }
  return data(input.hit.dmg, mergeData([{
    hit: {
      base: prod(input.total[base], subscript(input.talent.index[talentType], lvlMultiplier, { key: '_' })),
      move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional]))
}
export function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKey | undefined,
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
    weaponType: stringConst(gen.weaponTypeKey),
    premod: {},
    display: {
      character: {
        [key]: displayChar
      },
    },
  }
  if (element) {
    data.charEle = stringConst(element)
    data.display!.reaction = reactions[element]
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

  return mergeData([data, additional])
}
