import { getTalentStatKey } from "../../../Build/Build"
import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [46.89, 50.08, 53.28, 57.54, 60.74, 64.47, 69.26, 74.06, 78.85, 83.65, 88.44, 93.24, 98.04, 102.83, 107.63],
      [48.25, 51.54, 54.83, 59.22, 62.51, 66.35, 71.28, 76.22, 81.15, 86.09, 91.02, 95.96, 100.89, 105.83, 110.76],
      [61.05, 65.21, 69.38, 74.93, 79.09, 83.94, 90.19, 96.43, 102.68, 108.92, 115.16, 121.41, 127.65, 133.89, 140.14],
      [65.64, 70.12, 74.59, 80.56, 85.03, 90.26, 96.97, 103.68, 110.4, 117.11, 123.82, 130.54, 137.25, 143.96, 150.68],
      [33.27, 35.54, 37.81, 40.84, 43.1, 45.75, 49.15, 52.56, 55.96, 59.36, 62.77, 66.17, 69.57, 72.98, 76.38],//5.1
      [35.2, 37.6, 40, 43.2, 45.6, 48.4, 52, 55.6, 59.2, 62.8, 66.4, 70, 73.6, 77.2, 80.8],//5.2
      [85.96, 91.82, 97.68, 105.49, 111.36, 118.19, 126.98, 135.78, 144.57, 153.36, 162.15, 170.94, 179.73, 188.52, 197.31],//6
    ],
  },
  charged: {
    dmg: [135.96, 145.23, 154.5, 166.86, 176.13, 186.95, 200.85, 214.76, 228.66, 242.57, 256.47, 270.38, 284.28, 298.19, 312.09],
  },
  plunging: {
    dmg: [65.42, 69.88, 74.34, 80.29, 84.75, 89.95, 96.64, 103.33, 110.02, 116.71, 123.4, 130.1, 136.79, 143.48, 150.17],
    low: [130.81, 139.73, 148.65, 160.54, 169.46, 179.86, 193.24, 206.62, 220, 233.38, 246.76, 260.13, 273.51, 286.89, 300.27],
    high: [163.39, 174.53, 185.67, 200.52, 211.66, 224.66, 241.37, 258.08, 274.79, 291.5, 308.21, 324.92, 341.63, 358.34, 375.05],
  },
  skill: {
    atk_inc: [3.84, 4.07, 4.3, 4.6, 4.83, 5.06, 5.36, 5.66, 5.96, 6.26, 6.56, 6.85, 7.15, 7.45, 7.75],
    dmg: [64, 68.8, 73.6, 80, 84.8, 89.6, 96, 102.4, 108.8, 115.2, 121.6, 128, 136, 144, 152],
  },
  burst: {
    dmg: [303.27, 321.43, 339.59, 363.2, 381.36, 399.52, 423.13, 446.74, 470.34, 493.95, 517.56, 541.17, 564.78, 588.38, 611.99],
    low_dmg: [379.09, 401.79, 424.49, 454, 476.7, 499.4, 528.91, 558.42, 587.93, 617.44, 646.95, 676.46, 705.97, 735.48, 764.99],
    regen: [6.26, 6.64, 7.01, 7.5, 7.88, 8.25, 8.74, 9.23, 9.71, 10.2, 10.69, 11.18, 11.66, 12.15, 12.64],
    low_regen: [8.35, 8.85, 9.35, 10, 10.5, 11, 11.65, 12.3, 12.95, 13.6, 14.25, 14.9, 15.55, 16.2, 16.85]
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    dmg: stats => basicDMGFormula(data.charged.dmg[stats.tlvl.auto], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    atk_inc: stats => {
      const val = data.skill.atk_inc[stats.tlvl.skill] / 100
      return [s => Math.min(val * (s.premod?.finalHP ?? s.finalHP), 4 * s.baseATK), ["finalHP", "baseATK"]]
    },
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    dmgC2: stats => {
      const val = data.skill.dmg[stats.tlvl.skill] / 100
      const statKey = getTalentStatKey("skill", stats) + "_multi"
      return [s => (val * s.finalATK + 0.1 * s.finalHP) * s[statKey], ["finalHP", "finalATK", statKey]]
    }
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    low_dmg: stats => basicDMGFormula(data.burst.low_dmg[stats.tlvl.burst], stats, "burst"),
    regen: stats => {
      const val = data.burst.regen[stats.tlvl.burst] / 100
      return [s => val * s.finalHP * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    low_regen: stats => {
      const val = data.burst.low_regen[stats.tlvl.burst] / 100
      return [s => val * s.finalHP * s.heal_multi, ["finalHP", "heal_multi"]]
    },
  },
}
export default formula