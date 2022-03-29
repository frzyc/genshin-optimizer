import type { WeaponData } from "pipeline";
import { inferInfoMut, mergeData } from "../../Formula/api";
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
  additional: Data = {},
  displayWeapon: DisplaySub = {},
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
      premod: { [subStat.type]: input.weapon.sub },
      weapon: { sub: substatNode },
    })
  }
  return mergeData([...merging, inferInfoMut(additional, key)])
}
