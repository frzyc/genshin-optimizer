import { IFormulaSheet } from "../../../../Types/character"
import { basicDMGFormula } from "../../../../Util/FormulaUtil"

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
    dmg: [78.66, 84.56, 90.46, 98.33, 104.23, 110.13, 118, 125.86, 133.73, 141.6, 149.46, 157.33, 167.16, 176.99, 186.83],
    enerRegen: [3, 3, 3, 3.5, 3.5, 3.5, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  },
  burst: {
    dmg: [114.4, 122.98, 131.56, 143, 151.58, 160.16, 171.6, 183.04, 194.48, 205.92, 217.36, 228.8, 243.1, 257.4, 271.7],
    thunder: [32.8, 35.26, 37.72, 41, 43.46, 45.92, 49.2, 52.48, 55.76, 59.04, 62.32, 65.6, 69.7, 73.8, 77.9],
    enerRegen: [0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  }
}

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(data.charged.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) =>
    [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    enerRechInc: stats => {
      if (stats.ascension < 4) return [s => 20, []]
      return [s => 20 + (s.premod?.enerRech_ ?? s.enerRech_) / 10, ["enerRech_"]]
    }
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    thunder: stats => basicDMGFormula(data.burst.thunder[stats.tlvl.burst], stats, "burst"),
    //TODO: this needs testing
    thunder3: stats => basicDMGFormula(data.burst.thunder[stats.tlvl.burst] + 100, stats, "burst")
  }
}
export default formula