import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [37.6, 40.42, 43.24, 47, 49.82, 52.64, 56.4, 60.16, 63.92, 67.68, 71.44, 75.2, 79.9, 84.6, 89.3],
      [36, 38.7, 41.4, 45, 47.7, 50.4, 54, 57.6, 61.2, 64.8, 68.4, 72, 76.5, 81, 85.5],
      [44.8, 48.16, 51.52, 56, 59.36, 62.72, 67.2, 71.68, 76.16, 80.64, 85.12, 89.6, 95.2, 100.8, 106.4],
      [56.16, 60.37, 64.58, 70.2, 74.41, 78.62, 84.24, 89.86, 95.47, 101.09, 106.7, 112.32, 119.34, 126.36, 133.38],
    ],
  },
  charged: {
    dmg: [149.72, 160.95, 172.18, 187.15, 198.38, 209.61, 224.58, 239.55, 254.52, 269.5, 285.07, 305.43, 325.79, 346.15, 366.51],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59],
  },
  skill: {
    dmg: [132.8, 142.76, 152.72, 166, 175.96, 185.92, 199.2, 212.48, 225.76, 239.04, 252.32, 265.6, 282.2, 298.8, 315.4],
    dot: [32, 34.4, 36.8, 40, 42.4, 44.8, 48, 51.2, 54.4, 57.6, 60.8, 64, 68, 72, 76],
  },
  burst: {
    bubble_explosion: [442.4, 475.58, 508.76, 553, 586.18, 619.36, 663.6, 707.84, 752.08, 796.32, 840.56, 884.8, 940.1, 995.4, 1050.7],
    dmg_: [42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 60, 60, 60, 60, 60],
    omen_duration: [4, 4, 4, 4.5, 4.5, 4.5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")])),
  burst: {
    bubble_explosion: stats => basicDMGFormula(data.burst.bubble_explosion[stats.tlvl.burst], stats, "burst")
  },
  passive1: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill] / 2, stats, "skill"),
  },
  passive2: {
    bonus: stats => [s => (s.premod?.enerRech_ ?? s.enerRech_) * 0.2, ["enerRech_"]]
  }
}
export default formula