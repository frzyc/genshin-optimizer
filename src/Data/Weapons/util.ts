import type { WeaponData } from "pipeline";
import { mergeData } from "../../Formula/api";
import { MainStatKey, SubstatKey } from "../../Types/artifact";
import { WeaponKey, WeaponTypeKey } from "../../Types/consts";
import _weaponCurves from "../../Weapon/expCurve_gen.json";
import { input } from "../../Formula";
import { Data, DisplaySub } from "../../Formula/type";
import { infoMut, prod, stringConst, subscript, sum } from "../../Formula/utils";

// TODO: Remove this conversion after changing the file format
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

export function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  gen: WeaponData,
  substat2: MainStatKey | SubstatKey | undefined,
  displayWeapon: DisplaySub = {},
  additional: Data = {}
): Data {
  const result: Data = {
    base: {},
    premod: {},
    weapon: {
      key: stringConst(key), type: stringConst(type),
    },
    display: {
      [`weapon:${key}`]: displayWeapon
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

  return mergeData([result, additional])
}
