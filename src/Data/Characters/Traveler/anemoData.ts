import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import { absorbableEle } from "../dataUtil"
export const data = {
  normal: {
    hitArr: [
      [44.46, 48.08, 51.7, 56.87, 60.49, 64.63, 70.31, 76, 81.69, 87.89, 94.09, 100.3, 106.5, 112.71, 118.91],
      [43.43, 46.97, 50.5, 55.55, 59.09, 63.13, 68.68, 74.23, 79.79, 85.85, 91.91, 97.97, 104.03, 110.09, 116.15],
      [52.98, 57.29, 61.6, 67.76, 72.07, 77, 83.78, 90.55, 97.33, 104.72, 112.11, 119.5, 126.9, 134.29, 141.68],
      [58.31, 63.05, 67.8, 74.58, 79.33, 84.75, 92.21, 99.67, 107.12, 115.26, 123.4, 131.53, 139.67, 147.8, 155.94],
      [70.78, 76.54, 82.3, 90.53, 96.29, 102.88, 111.93, 120.98, 130.03, 139.91, 149.79, 159.66, 169.54, 179.41, 189.29],
    ],
  },
  charged: {
    hitArr: [
      [55.9, 60.45, 65, 71.5, 76.05, 81.25, 88.4, 95.55, 102.7, 110.5, 118.3, 126.1, 133.9, 141.7, 149.5],
      [60.72, 65.66, 70.6, 77.66, 82.6, 88.25, 96.02, 103.78, 111.55, 120.02, 128.49, 136.96, 145.44, 153.91, 162.38],
      [72.24, 78.12, 84, 92.4, 98.28, 105, 114.24, 123.48, 132.72, 142.8, 152.88, 162.96, 173.04, 183.12, 193.2],
    ],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]
  },
  skill: {
    initial_dmg: [12, 12.9, 13.8, 15, 15.9, 16.8, 18, 19.2, 20.4, 21.6, 22.8, 24, 25.5, 27, 28.5],
    initial_max: [16.8, 18.06, 19.32, 21, 22.26, 23.52, 25.2, 26.88, 28.56, 30.24, 31.92, 33.6, 35.7, 37.8, 39.9],
    storm_dmg: [176, 189.2, 202.4, 220, 233.2, 246.4, 264, 281.6, 299.2, 316.8, 334.4, 352, 374, 396, 418],
    storm_max: [192, 206.4, 220.8, 240, 254.4, 268.8, 288, 307.2, 326.4, 345.6, 364.8, 384, 408, 432, 456],
  },
  burst: {
    dmg: [80.8, 86.86, 92.92, 101, 107.06, 113.12, 121.2, 129.28, 137.36, 145.44, 153.52, 161.6, 171.7, 181.8, 191.9],
    dmg_: [24.8, 26.66, 28.52, 31, 32.86, 34.72, 37.2, 39.68, 42.16, 44.64, 47.12, 49.6, 52.7, 55.8, 58.9],
  }
}

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(data.charged.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")])),
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    ...Object.fromEntries(absorbableEle.map(eleKey =>
      [eleKey, stats => basicDMGFormula(data.burst.dmg_[stats.tlvl.burst], stats, "burst", eleKey)]))
  },
  passive2: {
    heal: stats => [s => 0.02 * s.finalHP * s.heal_multi, ["finalHP", "heal_multi"]],
  },
  passive1: {
    windAuto: stats => basicDMGFormula(60, stats, "normal", "anemo"),
  }
}
export default formula