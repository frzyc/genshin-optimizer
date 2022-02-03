import type { WeaponData } from "pipeline";
import { mergeData } from "../../Formula/api";
import { MainStatKey, SubstatKey } from "../../Types/artifact";
import { WeaponKey } from "../../Types/consts";
import _weaponCurves from "./expCurve_gen.json";
import { input } from "../../Formula";
import { Data, DisplaySub } from "../../Formula/type";
import { infoMut, prod, constant, subscript, sum } from "../../Formula/utils";

// TODO: Remove this conversion after changing the file format
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

export function dataObjForWeaponSheet(
  key: WeaponKey,
  gen: WeaponData,
  subStat2: MainStatKey | SubstatKey | "dmg_" | undefined = undefined,
  displayWeapon: DisplaySub = {},
  additional: Data = {}
): Data {
  const result: Data = {
    base: {},
    premod: {},
    total: {},
    weapon: {
      key: constant(key), type: constant(gen.weaponType),
    },
    display: {
      [`weapon:${key}`]: displayWeapon
    },
  }

  const { mainStat, subStat } = gen
  const merging = [result]

  if (mainStat.type !== "atk" && mainStat.type !== "def" && mainStat.type !== "hp") throw new Error("Main stat type must be `atk`")
  const mainStatNode = infoMut(sum(prod(mainStat.base, subscript(input.weapon.lvl, weaponCurves[mainStat.curve])), subscript(input.weapon.asc, gen.ascension.map(x => x.addStats[mainStat.type] ?? 0))), { key: mainStat.type })
  merging.push({ base: { [mainStat.type]: input.weapon.main }, weapon: { main: mainStatNode } })

  if (subStat) {
    if (subStat.type === "atk" || subStat.type === "def" || subStat.type === "hp") throw new Error("SubStat cannot be `atk`, `def`, or `hp`")
    const substatNode = infoMut(prod(subStat.base, subscript(input.weapon.lvl, weaponCurves[subStat.curve])), { key: subStat.type })
    merging.push({
      premod: subStat.type.endsWith('_dmg_')
        ? { dmgBonus: { [subStat.type.slice(0, -5)]: input.weapon.sub } }
        : { [subStat.type]: input.weapon.sub },
      weapon: { sub: substatNode }
    })
  }
  if (subStat2) {
    if (subStat2 === "atk" || subStat2 === "def" || subStat2 === "hp") throw new Error("SubStat 2 cannot be `atk`, `def`, or `hp`")
    const substat2Node = subscript(input.weapon.refineIndex, gen.addProps.map(x => x[subStat2] ?? NaN), { key: subStat2 })
    merging.push({
      premod: { [subStat2]: input.weapon.sub },
      weapon: { sub2: substat2Node },
    })
  }

  return mergeData([...merging, additional])
}
