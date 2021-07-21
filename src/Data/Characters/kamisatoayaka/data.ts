import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [45.73, 49.45, 53.17, 58.49, 62.21, 66.46, 72.31, 78.16, 84.01, 90.39, 96.77, 103.15, 109.53, 115.91, 122.29],
      [48.68, 52.65, 56.61, 62.27, 66.23, 70.76, 76.99, 83.22, 89.44, 96.24, 103.03, 109.82, 116.62, 123.41, 130.2],
      [62.62, 67.72, 72.82, 80.1, 85.19, 91.02, 99.03, 107.04, 115.05, 123.79, 132.53, 141.26, 150, 158.74, 167.48],
      [22.65, 24.49, 26.33, 28.97, 30.81, 32.92, 35.81, 38.71, 41.61, 44.77, 47.93, 51.09, 54.25, 57.41, 60.57],//×3
      [78.18, 84.55, 90.91, 100, 106.36, 113.64, 123.64, 133.64, 143.64, 154.55, 165.45, 176.36, 187.27, 198.18, 209.09]
    ]
  },
  charged: {
    hit: [55.13, 59.61, 64.1, 70.51, 75, 80.13, 87.18, 94.23, 101.28, 108.97, 116.66, 124.35, 132.05, 139.74, 147.43],//×3
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },
  skill: {
    dmg: [239.2, 257.14, 275.08, 299, 316.94, 334.88, 358.8, 382.72, 406.64, 430.56, 454.48, 478.4, 508.3, 538.2, 568.1]
  },
  burst: {
    cutting: [112.3, 120.72, 129.15, 140.38, 148.8, 157.22, 168.45, 179.68, 190.91, 202.14, 213.37, 224.6, 238.64, 252.68, 266.71],
    bloom: [168.45, 181.08, 193.72, 210.56, 223.2, 235.83, 252.68, 269.52, 286.36, 303.21, 320.05, 336.9, 357.96, 379.01, 400.07],
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill")
  },
  burst: {
    cutting: stats => basicDMGFormula(data.burst.cutting[stats.tlvl.burst], stats, "burst"),
    bloom: stats => basicDMGFormula(data.burst.bloom[stats.tlvl.skill], stats, "burst"),
  },
  constellation2: {
    dmg: stats => basicDMGFormula(data.burst.cutting[stats.tlvl.burst] / 5, stats, "burst"),
  }
}
export default formula