import { common, input } from "./index";
import { computeData, dataObjForArtifact, dataObjForArtifactSheets, dataObjForCharacter, dataObjForCharacterSheet, dataObjForWeapon, dataObjForWeaponSheet, dmgNode, mergeData } from "./api";
import _charCurves from "../Character/expCurve_gen.json"
import _weaponCurves from "../Weapon/expCurve_gen.json"
import data_gen from "../Data/Characters/Sucrose/data_gen.json"
import moonglow_data from "../Data/Weapons/Catalyst/EverlastingMoonglow/data_gen.json"
import { absorbableEle } from "../Data/Characters/dataUtil";
import { prod, threshold_add } from "./utils";
import { constant } from "./internal";

// TODO: Remove this conversion
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

export const data = {
  normal: {
    hitArr: [
      [33.46, 35.97, 38.48, 41.83, 44.34, 46.85, 50.2, 53.54, 56.89, 60.24, 63.58, 66.93, 71.11, 75.29, 79.48],
      [30.62, 32.91, 35.21, 38.27, 40.57, 42.86, 45.92, 48.99, 52.05, 55.11, 58.17, 61.23, 65.06, 68.89, 72.71],
      [38.45, 41.33, 44.22, 48.06, 50.94, 53.83, 57.67, 61.52, 65.36, 69.21, 73.05, 76.9, 81.7, 86.51, 91.31],
      [47.92, 51.51, 55.11, 59.9, 63.49, 67.08, 71.88, 76.67, 81.46, 86.25, 91.04, 95.84, 101.82, 107.81, 113.8],
    ]
  },
  charged: {
    dmg: [120.16, 129.17, 138.18, 150.2, 159.21, 168.22, 180.24, 192.26, 204.27, 216.29, 228.3, 240.32, 255.34, 270.36, 285.38],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59],
  },
  skill: {
    press: [211.2, 227.04, 242.88, 264, 279.84, 295.68, 316.8, 337.92, 359.04, 380.16, 401.28, 422.4, 448.8, 475.2, 501.6],
  },
  burst: {
    dot: [148, 159.1, 170.2, 185, 196.1, 207.2, 222, 236.8, 251.6, 266.4, 281.2, 296, 314.5, 333, 351.5],
    dmg_: [44, 47.3, 50.6, 55, 58.3, 61.6, 66, 70.4, 74.8, 79.2, 83.6, 88, 93.5, 99, 104.5],
  }
}

const artSheetData = dataObjForArtifactSheets()
const charSheetData = dataObjForCharacterSheet("Sucrose", "anemo",
  { offset: data_gen.base.hp, lvlCurve: charCurves[data_gen.curves.hp], ascCurve: data_gen.ascensions.map(x => x.props.hp) },
  { offset: data_gen.base.atk, lvlCurve: charCurves[data_gen.curves.atk], ascCurve: data_gen.ascensions.map(x => x.props.atk) },
  { offset: data_gen.base.def, lvlCurve: charCurves[data_gen.curves.def], ascCurve: data_gen.ascensions.map(x => x.props.def) },
  { ascCurve: data_gen.ascensions.map(x => x.props.anemo_dmg_), stat: "atk" },
  {
    normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
      [i, dmgNode("atk", arr, "normal")])),
    charge: Object.fromEntries(Object.entries(data.charged).map(([key, value]) =>
      [key, dmgNode("atk", value, "charge")])),
    plunge: Object.fromEntries(Object.entries(data.plunging).map(([key, value]) =>
      [key, dmgNode("atk", value, "plunge")])),
    skill: Object.fromEntries(Object.entries(data.skill).map(([key, value]) =>
      [key, dmgNode("atk", value, "skill")])),
    burst: {
      dot: dmgNode("atk", data.burst.dot, "burst"),
      ...Object.fromEntries(absorbableEle.map(key =>
        [key, dmgNode("atk", data.burst.dmg_, "burst", { /** Set absorption element */ })]))
    },
  },
  {
    // TODO: include
    // Teambuff: A1, A4,
    // Misc: C1, C2, C4, C6
    char: {
      skill: threshold_add(input.char.ascension, 3, 3),
      burst: threshold_add(input.char.ascension, 5, 3),
    },
    postmod: {
      // TODO: Add conditional
      eleMas: threshold_add(input.char.constellation, 6, prod(0.2, input.premod.eleMas)),
    }
  }
)
const weaponSheetData = dataObjForWeaponSheet("EverlastingMoonglow", "catalyst",
  [
    { stat: moonglow_data.mainStat.type as any, offset: moonglow_data.mainStat.base, lvlCurve: weaponCurves[moonglow_data.mainStat.curve] },
    { stat: moonglow_data.subStat.type as any, offset: moonglow_data.subStat.base, lvlCurve: weaponCurves[moonglow_data.subStat.curve], },
    { stat: "heal_", refinementCurve: moonglow_data.addProps.map(x => x.heal_) },
    { stat: "atk", ascCurve: moonglow_data.ascension.map(x => x.addStats.atk ?? 0) },
  ],
  {
    premod: {
      normal: constant(NaN) // TODO: Formula for normal atk bonus
    }
  }
)

/*
const artData = dataObjForArtifact({} as any)
const charData = dataObjForCharacter({} as any)
const weaponData = dataObjForWeapon({} as any)

const merged1 = mergeData({ number: common, string: {} }, artSheetData, charSheetData, charData, weaponSheetData)
const merged2 = mergeData(merged1, artData, weaponData)
*/
describe("API", () => {
  test("Sucrose", () => {
    console.log(artSheetData)
  })
})
